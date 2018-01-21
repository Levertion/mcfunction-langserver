import {
    createConnection, IPCMessageReader, IPCMessageWriter,
    TextDocumentSyncKind,
} from "vscode-languageserver";
import { DataManager } from "./data/manager";
import { mergeDeep } from "./imported_utils/merge_deep";
import { DeepReadonly } from "./types";

// Creates the LSP connection
const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

let data: DataManager;
// Server Startup Stuff - consider:
// https://github.com/Microsoft/language-server-protocol/issues/246
/**
 * The settings for this server. Readonly, local copy.
 */
const settings: McFunctionSettings = {} as McFunctionSettings;
connection.listen();

connection.onInitialize(() => {
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
    // data.acquireData().then((successful) => {
    // }).catch((e) => mcLangLog.internal(`Aquiring data had uncaught error: ${JSON.stringify(e)}`));
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
