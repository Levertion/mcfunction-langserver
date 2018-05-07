import { EventEmitter } from "events";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import {
    CompletionList, createConnection, Diagnostic, IPCMessageReader,
    IPCMessageWriter, TextDocumentSyncKind, WorkspaceFolder,
} from "vscode-languageserver";
import { mergeDeep } from "./misc_functions/third_party/merge_deep";

import { ComputeCompletions } from "./completions";
import { readSecurity } from "./data/cache_management";
import { DataManager } from "./data/manager";
import {
    actOnSecurity, calculateDataFolder, checkSecurity,
    commandErrorToDiagnostic, runChanges, setup_logging, splitLines,
} from "./misc_functions/";
import { parseDocument, parseLines } from "./parse";
import { FunctionInfo, WorkspaceSecurity } from "./types";

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
connection.listen();

//#region Data Storage
let manager: DataManager;
const documents: {
    [url: string]: FunctionInfo;
} = {};
// Avoids race condition between parsing after change and getting completions
const parseCompletionEvents = new EventEmitter();
let security: Promise<WorkspaceSecurity>;

let workspaces: WorkspaceFolder[];

let started = false;
let starting = false;
//#endregion

// For Server Startup logic, see:
// https://github.com/Microsoft/language-server-protocol/issues/246
connection.onInitialize((params) => {
    setup_logging(connection);
    workspaces = params.workspaceFolders || [];
    manager = new DataManager();
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
            },
            textDocumentSync: {
                change: TextDocumentSyncKind.Incremental,
                openClose: true,
            },
            workspace: {
                workspaceFolders: { changeNotifications: true, supported: true },
            },
        },
    };
});

// Handles the starting of the server
connection.onDidChangeConfiguration(async (params) => {
    let startinglocal = false;
    if (starting === false) {
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
    if (startinglocal === true) {
        const cacheread = await manager.readCache();
        if (cacheread === true) {
            started = true;
            reparseall();
        }
        const getDataResult = await manager.getGlobalData();
        if (getDataResult === true) {
            started = true;
            reparseall();
        } else if (cacheread === false) {
            connection.sendNotification("mcfunction/shutdown", getDataResult);
            return;
        }
    }
});

async function ensureSecure(settings: Partial<McFunctionSettings>) {
    const secure = await security;
    const newsettings = mergeDeep({}, global.mcLangSettings, settings) as McFunctionSettings;
    const securityResult = checkSecurity(workspaces, secure, newsettings);
    if (securityResult !== true) {
        // Failed security checkup challenge
        const safetocontinue = await actOnSecurity(securityResult, connection, secure);
        if (!safetocontinue) {
            connection.sendNotification("mcfunction/shutdown",
                `Shutting down because of insecure settings: '${securityResult.issues.join("', '")}'`);
            return;
        }
    }
    global.mcLangSettings = newsettings;
}

connection.onDidOpenTextDocument((params) => {
    const uri = params.textDocument.uri;
    const dataPackRoot = calculateDataFolder(uri);
    const parsethis = () => {
        parseDocument(documents[uri],
            manager, parseCompletionEvents, uri);
        sendDiagnostics(uri);
    };
    documents[uri] = {
        datapack_root: dataPackRoot,
        lines: splitLines(params.textDocument.text),
    };
    if (!!dataPackRoot) {
        manager.readPackFolderData(dataPackRoot).then(() => {
            if (started === true && documents.hasOwnProperty(uri)) {
                parsethis();
            }
        }).catch((e) => {
            mcLangLog(`Getting pack folder data failed for reason: '${e}'`);
        });
    }
    if (started === true) {
        parsethis();
    }
});

connection.onDidChangeTextDocument((params) => {
    const uri = params.textDocument.uri;
    const changedlines = runChanges(params, documents[uri]);
    if (started === true) {
        parseLines(documents[uri], manager, parseCompletionEvents, uri, changedlines);
        sendDiagnostics(uri);
    }
});

function sendDiagnostics(uri: string) {
    const doc = documents[uri];
    const diagnostics: Diagnostic[] = [];
    for (let line = 0; line < doc.lines.length; line++) {
        const lineContent = doc.lines[line];
        if (!!lineContent.parseInfo && !!lineContent.parseInfo.errors) {
            diagnostics.push(...lineContent.parseInfo.errors.map((error) => commandErrorToDiagnostic(error, line)));
        }
    }
    connection.sendDiagnostics({ uri, diagnostics });
}

connection.onDidCloseTextDocument((params) => {
    // Clear diagnostics - might not be needed
    connection.sendDiagnostics({ uri: params.textDocument.uri, diagnostics: [] });
    delete documents[params.textDocument.uri];
});

connection.workspace.onDidChangeWorkspaceFolders(async (params) => {
    for (const workspace of params.removed) {
        for (let index = 0; index < workspaces.length; index++) {
            if (workspaces[index].uri === workspace.uri) {
                workspaces.splice(index, 1);
            }
        }
    }
    workspaces.push(...params.added);
    // Makes sure that this workspace doesn't have insecure settings disabled
    await ensureSecure({});
});

connection.onCompletion((params) => {
    const doc = documents[params.textDocument.uri];
    const line = doc.lines[params.position.line];
    const computeCompletionsLocal = () => ComputeCompletions(params.position.line,
        doc, params.position.character, manager);
    if (!started) {
        return [];
    }
    if (!!line.parseInfo) {
        return computeCompletionsLocal();
    } else {
        return promisify((cb) =>
            parseCompletionEvents.once(`${params.textDocument.uri}:${params.position.line}`, cb))().
            then<CompletionList, never>(() => computeCompletionsLocal());
    }
});
