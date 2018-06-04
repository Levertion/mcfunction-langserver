import { EventEmitter } from "events";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import {
    CompletionList,
    createConnection,
    Diagnostic,
    IPCMessageReader,
    IPCMessageWriter,
    TextDocumentSyncKind
} from "vscode-languageserver";
import { mergeDeep } from "./misc_functions/third_party/merge_deep";

import { computeCompletions } from "./completions";
import { readSecurity } from "./data/cache_management";
import { DataManager } from "./data/manager";
import {
    actOnSecurity,
    calculateDataFolder,
    commandErrorToDiagnostic,
    runChanges,
    securityIssues,
    setup_logging,
    splitLines
} from "./misc_functions/";
import { parseDocument, parseLines } from "./parse";
import { FunctionInfo, WorkspaceSecurity } from "./types";

const connection = createConnection(
    new IPCMessageReader(process),
    new IPCMessageWriter(process)
);
connection.listen();

//#region Data Storage
let manager: DataManager;
const documents: {
    [url: string]: FunctionInfo;
} = {};
// Avoids race condition between parsing after change and getting completions
const parseCompletionEvents = new EventEmitter();
let security: Promise<WorkspaceSecurity>;

let started = false;
let starting = false;
//#endregion

// For Server Startup logic, see:
// Https://github.com/Microsoft/language-server-protocol/issues/246
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
            if (documents.hasOwnProperty(uri)) {
                const doc = documents[uri];
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
        const getDataResult = await manager.getGlobalData();
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
    const dataPackRoot = calculateDataFolder(uri);
    const parsethis = () => {
        parseDocument(documents[uri], manager, parseCompletionEvents, uri);
        sendDiagnostics(uri);
    };
    documents[uri] = {
        datapack_root: dataPackRoot,
        lines: splitLines(params.textDocument.text)
    };
    if (!!dataPackRoot) {
        manager
            .readPackFolderData(dataPackRoot)
            .then(() => {
                if (started && documents.hasOwnProperty(uri)) {
                    parsethis();
                }
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
    const changedlines = runChanges(params, documents[uri]);
    if (started) {
        parseLines(
            documents[uri],
            manager,
            parseCompletionEvents,
            uri,
            changedlines
        );
        sendDiagnostics(uri);
    }
});

function sendDiagnostics(uri: string): void {
    const doc = documents[uri];
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
        uri: params.textDocument.uri,
        diagnostics: []
    });
    // tslint:disable-next-line:no-dynamic-delete
    delete documents[params.textDocument.uri];
});

connection.onCompletion(params => {
    const doc = documents[params.textDocument.uri];
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
