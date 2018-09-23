import { EventEmitter } from "events";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import { Interval, IntervalTree } from "node-interval-tree";
import {
    CompletionList,
    createConnection,
    Diagnostic,
    DidChangeWatchedFilesNotification,
    Hover,
    IPCMessageReader,
    IPCMessageWriter,
    Location,
    Position,
    TextDocumentPositionParams,
    TextDocumentSyncKind
} from "vscode-languageserver/lib/main";
import Uri from "vscode-uri";

import { computeCompletions } from "./completions";
import { readSecurity } from "./data/cache";
import { DataManager } from "./data/manager";
import { CommandNode } from "./data/types";
import {
    actOnSecurity,
    commandErrorToDiagnostic,
    followPath,
    isSuccessful,
    parseDataPath,
    runChanges,
    securityIssues,
    setup_logging,
    splitLines
} from "./misc-functions";
import { mergeDeep } from "./misc-functions/third_party/merge-deep";
import { parseDocument, parseLines } from "./parse";
import {
    CommandLine,
    FunctionInfo,
    MiscInfo,
    ParseNode,
    SubAction,
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

connection.onHover(params => {
    if (started) {
        const docLine = getLine(params);
        if (docLine) {
            function computeIntervalHovers<T extends Interval>(
                intervals: T[],
                commandLine: CommandLine,
                line: number,
                map: (intervals: T[]) => Hover["contents"]
            ): Hover {
                const end: Position = {
                    character: intervals.reduce(
                        (acc, v) => Math.max(acc, v.high),
                        0
                    ),
                    line
                };
                const start: Position = {
                    character: intervals.reduce(
                        (acc, v) => Math.min(acc, v.low),
                        commandLine.text.length
                    ),
                    line
                };
                return {
                    contents: map(intervals),
                    range: { start, end }
                };
            }
            const hovers = getActionsOfKind(docLine, params.position, "hover");
            if (hovers.length > 0) {
                return computeIntervalHovers(
                    hovers,
                    docLine,
                    params.position.line,
                    i => i.map(v => v.data)
                );
            } else {
                const tree = getNodeTree(docLine);
                if (tree) {
                    const matching = tree.search(
                        params.position.character,
                        params.position.character
                    );
                    if (matching.length > 0) {
                        return computeIntervalHovers(
                            matching,
                            docLine,
                            params.position.line,
                            i =>
                                i.map<string>(node => {
                                    const data = followPath(
                                        manager.globalData.commands,
                                        node.path
                                    ) as CommandNode;
                                    return `${
                                        data.type === "literal"
                                            ? "literal"
                                            : `\`${data.parser}\` parser`
                                    } on path '${node.path.join(", ")}'`;
                                })
                        );
                    }
                }
            }
        }
    }
    return undefined;
});

connection.onDefinition(params => {
    const docLine = getLine(params);
    if (docLine) {
        const actions = getActionsOfKind(docLine, params.position, "source");
        const start: Position = { line: 0, character: 0 };
        return actions.map<Location>(a => ({
            range: { start, end: start },
            uri: Uri.file(a.data as any).toString()
        }));
    }
    return [];
});

function getLine(params: TextDocumentPositionParams): CommandLine | undefined {
    const doc = documents.get(params.textDocument.uri);
    if (doc) {
        const line = doc.lines[params.position.line];

        return line;
    }
    return undefined;
}

function getActionsOfKind(
    line: CommandLine,
    position: Position,
    kind: SubAction["type"]
): SubAction[] {
    if (line.parseInfo) {
        if (!line.actions) {
            line.actions = new IntervalTree();
            for (const action of line.parseInfo.actions) {
                line.actions.insert(action);
            }
        }
        const tree = line.actions;
        return tree
            .search(position.character, position.character)
            .filter(v => v.type === kind);
    }
    return [];
}

function getNodeTree(line: CommandLine): IntervalTree<ParseNode> | undefined {
    if (line.nodes) {
        return line.nodes;
    }
    if (line.parseInfo) {
        const tree = new IntervalTree<ParseNode>();
        for (const node of line.parseInfo.nodes) {
            tree.insert(node);
        }
        return tree;
    }
    return undefined;
}
