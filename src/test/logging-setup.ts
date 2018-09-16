function setup_logging(): void {
    const logger = (message: string) => {
        // tslint:disable-next-line:no-console
        console.log(message);
    };

    // tslint:disable-next-line:prefer-object-spread
    global.mcLangLog = Object.assign(logger, {
        internal: (message: string) => {
            logger(`[McFunctionInternal] ${message}`);
        }
    });
}
setup_logging();
