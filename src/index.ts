import {
    createConnection, Diagnostic, IPCMessageReader,
    IPCMessageWriter,
    TextDocumentSyncKind,
} from "vscode-languageserver";
import { DataManager } from "./data/manager";
import { calculateDataFolder, singleStringLineToCommandLines } from "./function_utils";
import { mergeDeep } from "./imported_utils/merge_deep";
import { commandErrorToDiagnostic, runChanges } from "./langserver_conversions";
import { DeepReadonly, FunctionInfo } from "./types";

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
connection.listen();

//#region Data Storage
let data: DataManager;
const documents: {
    [url: string]: FunctionInfo;
} = {};
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
    // To stop Typescript complaining that it is never read.
    mcLangLog(JSON.stringify(data));
    data.acquireData().then((successful) => {
        if (successful === true) {
            started = true;
            for (const docUri in documents) {
                if (documents.hasOwnProperty(docUri)) {
                    // ParseDocument documents[docUri];
                }
            }
        } else {
            connection.sendNotification("mcfunction/shutdown");
        }
    }).catch((e) => {
        mcLangLog.internal(`Aquiring data had uncaught error: ${JSON.stringify(e)}`);
        connection.sendNotification("mcfunction/shutdown");
    });
    return {
        capabilities: {
            textDocumentSync: {
                change: TextDocumentSyncKind.Incremental,
                openClose: true,
            },
        },
    };
});

connection.onDidChangeConfiguration((params) => {
    global.mcLangSettings = mergeDeep(settings, params.settings.mcfunction) as DeepReadonly<McFunctionSettings>;
});

connection.onDidOpenTextDocument(async (params) => {
    const datapackRoot = calculateDataFolder(params.textDocument.uri, rootFolder);
    documents[params.textDocument.uri] = {
        data: { local_pack_data: {} },
        datapack_root: datapackRoot,
        lines: singleStringLineToCommandLines(params.textDocument.text),
    };
    // await Get Data from the dataManager for this datapacks folder.
    if (started === true) {
        // ParseDocument,documents[params.textdocument.uri]
        sendDiagnostics(params.textDocument.uri);
    }
});

function sendDiagnostics(uri: string) {
    const doc = documents[uri];
    const diagnostics: Diagnostic[] = [];
    for (let line = 0; line < doc.lines.length; line++) {
        const lineContent = doc.lines[line];
        if (!!lineContent.error) {
            diagnostics.push(commandErrorToDiagnostic(lineContent.error, line));
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
    runChanges(params, documents[params.textDocument.uri]);
});
