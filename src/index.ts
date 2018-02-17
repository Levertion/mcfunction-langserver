import { EventEmitter } from "events";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import {
    CompletionList, createConnection, Diagnostic,
    IPCMessageReader,
    IPCMessageWriter,
    TextDocumentSyncKind,
} from "vscode-languageserver";
import { ComputeCompletions } from "./completions";
import { DataManager } from "./data/manager";
import { calculateDataFolder, singleStringLineToCommandLines } from "./function_utils";
import { mergeDeep } from "./imported_utils/merge_deep";
import { commandErrorToDiagnostic, runChanges } from "./langserver_conversions";
import { parseLines } from "./parse/document_parse";
import { DeepReadonly, FunctionInfo } from "./types";

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
connection.listen();

//#region Data Storage
let data: DataManager;
const documents: {
    [url: string]: FunctionInfo;
} = {};
const eventManager = new EventEmitter();
/**
 * The settings for this server. Local Copy inside index.
 * Are readonly when distributed
 */
const settings: McFunctionSettings = {} as McFunctionSettings;
/**
 * The root workspace folder
 */
let rootFolder: string;
//#endregion

// For Server Startup logic, see:
// https://github.com/Microsoft/language-server-protocol/issues/246
let started = false;
connection.onInitialize((params) => {
    rootFolder = params.rootUri || "";
    const log = (message: string) => {
        connection.console.log(message);
    };
    global.mcLangLog = Object.assign<InternalLog, McLogger>(log, {
        internal: (m: string) => {
            if (settings.trace.internalLogging === true) {
                log(`[McFunctionInternal] ${m}`);
            }
        },
    });
    data = new DataManager();
    const reparseAll = () => {
        for (const docUri in documents) {
            if (documents.hasOwnProperty(docUri)) {
                parseLines(documents[docUri], data, eventManager, docUri);
                sendDiagnostics(docUri);
            }
        }
    };
    mcLangLog("Getting data");
    promisify((cb) => {
        eventManager.once("settingscomplete", cb);
    })().then(async () => {
        const successful = await data.readCache();
        if (successful === true) {
            mcLangLog("Reading cache successful");
            started = true;
            reparseAll();
            const result = await data.getGlobalData();
            if (result === true) {
                reparseAll();
            } else {
                mcLangLog(result);
            }
        } else {
            mcLangLog("Reading cache failed");
            const result = await data.getGlobalData();
            mcLangLog("Finished getting globaldata");
            if (result === true) {
                started = true;
                reparseAll();
            } else {
                mcLangLog(result);
                connection.sendNotification("mcfunction/shutdown", result);
            }
        }
    }).catch((e) => {
        mcLangLog.internal(`Aquiring data had uncaught error: ${JSON.stringify(e)}`);
        connection.sendNotification("mcfunction/shutdown", JSON.stringify(e));
    });
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
            },
            textDocumentSync: {
                change: TextDocumentSyncKind.Incremental,
                openClose: true,
            },
        },
    };
});

connection.onDidChangeConfiguration((params) => {
    mcLangLog(`${JSON.stringify(params)}`);
    global.mcLangSettings = mergeDeep(settings, params.settings.mcfunction) as DeepReadonly<McFunctionSettings>;
    eventManager.emit("settingscomplete");
});

connection.onDidOpenTextDocument((params) => {
    const uri = params.textDocument.uri;
    const datapackRoot = calculateDataFolder(uri, rootFolder);
    documents[uri] = {
        datapack_root: datapackRoot,
        lines: singleStringLineToCommandLines(params.textDocument.text),
    };
    if (datapackRoot.length > 0) {
        data.aquirePackFolderData(documents[uri].datapack_root).then(() => {
            if (started === true && documents.hasOwnProperty(uri)) {
                parseLines(documents[uri],
                    data, eventManager, uri);
                sendDiagnostics(uri);
            }
        }).catch((e) => {
            mcLangLog(`Getting pack folder data failed for reason: '${e}'`);
        });
    }
    if (started === true) {
        parseLines(documents[uri],
            data, eventManager, uri);
        sendDiagnostics(uri);
    }
});

function sendDiagnostics(uri: string) {
    const doc = documents[uri];
    const diagnostics: Diagnostic[] = [];
    for (let line = 0; line < doc.lines.length; line++) {
        const lineContent = doc.lines[line];
        if (!!lineContent.parseInfo && lineContent.parseInfo.errors) {
            diagnostics.push(...lineContent.parseInfo.errors.map((error) => commandErrorToDiagnostic(error, line)));
        }
    }
    connection.sendDiagnostics({ uri, diagnostics: [] }); // Clear all diagnostics.
    connection.sendDiagnostics({ uri, diagnostics });
}

connection.onDidCloseTextDocument((params) => {
    connection.sendDiagnostics({ uri: params.textDocument.uri, diagnostics: [] }); // Clear all diagnostics.
    delete documents[params.textDocument.uri];
});

connection.onDidChangeTextDocument((params) => {
    const uri = params.textDocument.uri;
    const changed = runChanges(params, documents[uri]);
    if (started === true) {
        parseLines(documents[uri], data, eventManager, uri, changed);
        sendDiagnostics(uri);
    }
});

connection.onCompletion((params) => {
    const doc = documents[params.textDocument.uri];
    const line = doc.lines[params.position.line];
    const computeCompletionsLocal = () => ComputeCompletions(params.position.line,
        doc, params.position.character, data);
    if (!!line.parseInfo) {
        return computeCompletionsLocal();
    } else {
        return promisify((cb) =>
            eventManager.once(`${params.textDocument.uri}:${params.position.line}`, cb))().
            then<CompletionList, never>(() => computeCompletionsLocal());
    }
});
