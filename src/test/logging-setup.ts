import * as path from "path";
const logger = (message: string) => {
    // tslint:disable-next-line:no-console
    console.log(message);
};

process.env.MCFUNCTION_CACHE_DIR = path.join(process.cwd(), "cache");

// tslint:disable-next-line:prefer-object-spread
global.mcLangLog = Object.assign(logger, {
    internal: (message: string) => {
        logger(`[McFunctionInternal] ${message}`);
    }
});
