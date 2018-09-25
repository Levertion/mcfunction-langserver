import * as path from "path";

// Allow using "util".promisify in tests.
import { shim } from "util.promisify";
shim();
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
