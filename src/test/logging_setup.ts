const logger = (message: string) => {
    // tslint:disable-next-line:no-console
    console.log(message);
};

global.mcLangLog = Object.assign(logger,
    { internal: (message: string) => logger(`[McFunctionInternal] ${message}`) });

export function trick() {
    // Does nothing but tricks the compiler into actually including this file.
}
