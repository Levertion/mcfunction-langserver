import { IConnection } from "vscode-languageserver/lib/main";

export function setup_logging(connection: IConnection) {
    const log = (message: string) => {
        connection.console.log(message);
    };
    global.mcLangLog = Object.assign<InternalLog, McLogger>(log, {
        internal: (m: string) => {
            if (mcLangSettings.trace.internalLogging === true) {
                log(`[McFunctionInternal] ${m}`);
            }
        },
    });
}
