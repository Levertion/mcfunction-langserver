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
    TextDocumentSyncKind
} from "vscode-languageserver/lib/main";
import { mergeDeep } from "./misc-functions/third_party/merge-deep";

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
import { parseDocument, parseLines } from "./parse";
import { FunctionInfo, MiscInfo, WorkspaceSecurity } from "./types";

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
            textDocumentSync: {
                change: TextDocumentSyncKind.Incremental,
                openClose: true
            }
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
        for (const uri in documents) {
            if (documents.has(uri)) {
                const doc = documents.get(uri) as FunctionInfo;
                parseDocument(doc, manager, parseCompletionEvents, uri);
                sendDiagnostics(uri);
            }
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
    const issues = securityIssues(newsettings, secure);
    if (issues.length > 0) {
        // Failed security checkup challenge
        const safetocontinue = await actOnSecurity(issues, connection, secure);
        if (!safetocontinue) {
            connection.sendNotification(
                "mcfunction/shutdown",
                `Shutting down because of insecure settings: '${issues.join(
                    "', '"
                )}'`
            );
            return;
        }
    }
    global.mcLangSettings = newsettings;
}

connection.onDidOpenTextDocument(params => {
    const uri = params.textDocument.uri;
    const dataPackSegments = parseDataPath(uri);
    const parsethis = () => {
        // Sanity check
        if (documents.has(uri)) {
            parseDocument(
                documents.get(uri) as FunctionInfo,
                manager,
                parseCompletionEvents,
                uri
            );
            sendDiagnostics(uri);
        }
    };
    documents.set(uri, {
        lines: splitLines(params.textDocument.text),
        pack_segments: dataPackSegments
    });
    if (!!dataPackSegments) {
        manager
            .readPackFolderData(dataPackSegments.packsFolder)
            .then(first => {
                if (isSuccessful(first)) {
                    connection.client.register(
                        DidChangeWatchedFilesNotification.type,
                        {
                            watchers: [
                                { globPattern: `${dataPackSegments}**/*` }
                            ]
                        }
                    );
                }
                if (started && documents.hasOwnProperty(uri)) {
                    parsethis();
                }
                handleMiscInfo(first.misc);
            })
            .catch(e => {
                mcLangLog(`Getting pack folder data failed for reason: '${e}'`);
            });
    }
    if (started) {
        parsethis();
    }
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
                    group: misc.message
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
                    const { group: _, ...rest } = value;
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
                    range: {
                        end: { line: 0, character: 0 },
                        start: { line: 0, character: 0 }
                    }
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
