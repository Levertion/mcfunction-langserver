import { IConnection } from "vscode-languageserver";

export function setup_logging(connection: IConnection): void {
  const log = (message: string) => {
    connection.console.log(message);
  };
  // tslint:disable-next-line:prefer-object-spread
  global.mcLangLog = Object.assign(log, {
    internal: (m: string) => {
      if (mcLangSettings.trace.internalLogging) {
        log(`[McFunctionInternal] ${m}`);
      }
    }
  });
}
