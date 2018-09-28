import { EventEmitter } from "events";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import {
    CompletionList,
    createConnection,
    Diagnostic,
    DidChangeWatchedFilesNotification,
    IPCMessageReader,
    IPCMessageWriter,
    Location,
    Position,
    TextDocumentPositionParams,
    TextDocumentSyncKind
} from "vscode-languageserver/lib/main";
import Uri from "vscode-uri";

import {
    definitionProvider,
    getWorkspaceSymbols,
    hoverProvider,
    signatureHelpProvider
} from "./actions";
import { computeCompletions } from "./completions";
import { readSecurity } from "./data/cache";
import { DataManager } from "./data/manager";
import {
    actOnSecurity,
    commandErrorToDiagnostic,
    isSuccessful,
    parseDataPath,
    runChanges,
    securityIssues,
    setup_logging,
    splitLines
} from "./misc-functions";
import { mergeDeep } from "./misc-functions/third_party/merge-deep";
import { parseDocument, parseLines } from "./parse";
import { blankRange } from "./test/blanks";
import {
    CommandLine,
    FunctionInfo,
    MiscInfo,
    WorkspaceSecurity
} from "./types";

const connection = createConnection(
    new IPCMessageReader(process),
    new IPCMessageWriter(process)
);
connection.listen();

//#region Data Storage
let manager: DataManager;
const documents: Map<string, FunctionInfo> = new Map();
const fileErrors = new Map<string, { [group: string]: string }>();
// Avoids race condition between parsing after change and getting completions
const parseCompletionEvents = new EventEmitter();
let security: Promise<WorkspaceSecurity>;

let started = false;
let starting = false;
//#endregion

// For Server Startup logic, see: https://github.com/Microsoft/language-server-protocol/issues/246
connection.onInitialize(() => {
    setup_logging(connection);

    manager = new DataManager();
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false
            },
            definitionProvider: true,
            hoverProvider: true,
            signatureHelpProvider: { triggerCharacters: [" "] },
            textDocumentSync: {
                change: TextDocumentSyncKind.Incremental,
                openClose: true
            },
            workspaceSymbolProvider: true
        }
    };
});

// Handles the starting of the server
connection.onDidChangeConfiguration(async params => {
    let startinglocal = false;
    if (!starting) {
        starting = true;
        startinglocal = true;
        global.mcLangSettings = {} as McFunctionSettings;
        security = readSecurity();
    }
    await ensureSecure(params.settings);
    const reparseall = () => {
        for (const [uri, doc] of documents.entries()) {
            loadData(uri);
            parseDocument(doc, manager, parseCompletionEvents, uri);
            sendDiagnostics(uri);
        }
    };
    if (startinglocal) {
        const cacheread = await manager.readCache();
        if (cacheread) {
            started = true;
            reparseall();
        }
        const getDataResult = await manager.loadGlobalData();
        if (getDataResult === true) {
            started = true;
            reparseall();
        } else if (!cacheread) {
            connection.sendNotification("mcfunction/shutdown", getDataResult);
            return;
        }
    }
});

async function ensureSecure(settings: {
    mcfunction: Partial<McFunctionSettings>;
}): Promise<void> {
    const secure = await security;
    const newsettings = mergeDeep(
        {},
        global.mcLangSettings,
        settings.mcfunction
    ) as McFunctionSettings;

    try {
        const issues = securityIssues(newsettings, secure);
        if (issues.length > 0) {
            // Failed security checkup challenge
            const safeToContinue = await actOnSecurity(
                issues,
                connection,
                secure
            );
            if (!safeToContinue) {
                connection.sendNotification(
                    "mcfunction/shutdown",
                    `Shutting down because of insecure settings: '${issues.join(
                        "', '"
                    )}'`
                );
                return;
            }
        }
    } catch (error) {
        connection.sendNotification(
            "mcfunction/shutdown",
            `Shutting down because of insecure settings: '${error}'`
        );
        return;
    }
    global.mcLangSettings = newsettings;
}

function loadData(uri: string): void {
    const doc = documents.get(uri);
    if (doc && doc.pack_segments) {
        const segments = doc.pack_segments;
        manager
            .readPackFolderData(segments.packsFolder)
            .then(first => {
                if (isSuccessful(first)) {
                    connection.client.register(
                        DidChangeWatchedFilesNotification.type,
                        {
                            watchers: [
                                {
                                    globPattern: `${segments.packsFolder}/**/*`
                                }
                            ]
                        }
                    );
                }
                parseDocument(doc, manager, parseCompletionEvents, uri);
                sendDiagnostics(uri);
                handleMiscInfo(first.misc);
            })
            .catch(e => {
                mcLangLog(`Getting pack folder data failed for reason: '${e}'`);
            });
    }
}

connection.onDidOpenTextDocument(params => {
    const uri = params.textDocument.uri;
    const uriClass = Uri.parse(uri);
    const parsethis = () => {
        // Sanity check
        if (started && documents.has(uri)) {
            parseDocument(
                documents.get(uri) as FunctionInfo,
                manager,
                parseCompletionEvents,
                uri
            );
            sendDiagnostics(uri);
        }
    };
    if (uriClass.scheme === "file") {
        const fsPath = uriClass.fsPath;
        const dataPackSegments = parseDataPath(fsPath);
        documents.set(uri, {
            lines: splitLines(params.textDocument.text),
            pack_segments: dataPackSegments
        });
        if (started) {
            loadData(uri);
        }
        parsethis();
    } else {
        documents.set(uri, {
            lines: splitLines(params.textDocument.text),
            pack_segments: undefined
        });
    }
    parsethis();
});

connection.onDidChangeTextDocument(params => {
    const uri = params.textDocument.uri;
    const document = documents.get(uri) as FunctionInfo;
    const changedlines = runChanges(params, document);
    if (started) {
        parseLines(document, manager, parseCompletionEvents, uri, changedlines);
        sendDiagnostics(uri);
    }
});

function sendDiagnostics(uri: string): void {
    const doc = documents.get(uri) as FunctionInfo;
    const diagnostics: Diagnostic[] = [];
    for (let line = 0; line < doc.lines.length; line++) {
        const lineContent = doc.lines[line];
        if (!!lineContent.parseInfo && !!lineContent.parseInfo.errors) {
            diagnostics.push(
                ...lineContent.parseInfo.errors.map(error =>
                    commandErrorToDiagnostic(error, line)
                )
            );
        }
    }
    connection.sendDiagnostics({ uri, diagnostics });
}

connection.onDidCloseTextDocument(params => {
    // Clear diagnostics - might not be needed
    connection.sendDiagnostics({
        diagnostics: [],
        uri: params.textDocument.uri
    });
    documents.delete(params.textDocument.uri);
});

connection.onDidChangeWatchedFiles(async e => {
    const result = await manager.handleChanges(e);
    handleMiscInfo(result.misc);
});

function handleMiscInfo(miscInfos: MiscInfo[]): void {
    const changedFileErrors = new Set<string>();
    for (const misc of miscInfos) {
        if (misc.kind === "FileError") {
            changedFileErrors.add(misc.filePath);
            const value = fileErrors.get(misc.filePath);
            if (value) {
                fileErrors.set(misc.filePath, {
                    ...value,
                    [misc.group]: misc.message
                });
            } else {
                fileErrors.set(misc.filePath, {
                    group: misc.message
                });
            }
        }
        if (misc.kind === "ClearError") {
            changedFileErrors.add(misc.filePath);
            const group = misc.group;
            if (group) {
                const value = fileErrors.get(misc.filePath);
                if (value) {
                    const { [group]: _, ...rest } = value;
                    fileErrors.set(misc.filePath, { ...rest });
                }
            } else {
                fileErrors.delete(misc.filePath);
            }
        }
    }
    for (const uri of changedFileErrors) {
        const value = fileErrors.get(uri);
        if (value) {
            const diagnostics: Diagnostic[] = [];
            for (const group of Object.keys(value)) {
                diagnostics.push({
                    message: value[group],
                    range: blankRange
                });
            }
            connection.sendDiagnostics({ uri, diagnostics });
        }
    }
}

connection.onCompletion(params => {
    const doc = documents.get(params.textDocument.uri) as FunctionInfo;
    const line = doc.lines[params.position.line];
    const computeCompletionsLocal = () =>
        computeCompletions(
            params.position.line,
            params.position.character,
            doc,
            manager
        );
    if (!started) {
        return [];
    }
    if (line.hasOwnProperty("parseInfo")) {
        return computeCompletionsLocal();
    } else {
        return promisify(cb =>
            parseCompletionEvents.once(
                `${params.textDocument.uri}:${params.position.line}`,
                cb
            )
        )().then<CompletionList>(computeCompletionsLocal);
    }
});

const und = () => undefined;
connection.onCodeAction(und); // Research what this means
connection.onDefinition(prepare<Location[]>(definitionProvider, []));
connection.onDocumentHighlight(und);
// #connection.onDocumentSymbol(und); // This is for sections - there are none in mcfunctions
connection.onWorkspaceSymbol(query =>
    getWorkspaceSymbols(manager, query.query)
);
connection.onHover(prepare(hoverProvider, undefined));
connection.onSignatureHelp(prepare(signatureHelpProvider));

function prepare<T>(
    func: (
        line: CommandLine,
        loc: Position,
        document: FunctionInfo,
        manager: DataManager
    ) => T,
    fallback?: T
): (params: TextDocumentPositionParams) => T | undefined {
    return params => {
        if (started) {
            const doc = documents.get(params.textDocument.uri);
            if (doc) {
                const docLine = doc.lines[params.position.line];
                return func(docLine, params.position, doc, manager);
            }
        }
        return fallback;
    };
}
