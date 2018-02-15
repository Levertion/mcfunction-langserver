import { EventEmitter } from "events";
import { promisify } from "util";
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
const parseCompleteEmitter = new EventEmitter();
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
                    parseLines(documents[docUri], data, parseCompleteEmitter, docUri);
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
    global.mcLangSettings = mergeDeep(settings, params.settings.mcfunction) as DeepReadonly<McFunctionSettings>;
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
                    data, parseCompleteEmitter, uri);
                sendDiagnostics(uri);
            }
        });
    }
    if (started === true) {
        parseLines(documents[uri],
            data, parseCompleteEmitter, uri);
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
    runChanges(params, documents[uri]);
    parseLines(documents[uri], data, parseCompleteEmitter, uri);
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
            parseCompleteEmitter.once(`${params.textDocument.uri}:${params.position.line}`, cb))().
            then<CompletionList, never>(() => computeCompletionsLocal());
    }
});
