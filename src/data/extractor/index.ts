import * as fs from "fs";
import { tmpdir } from "os";
import * as path from "path";
import { promisify } from "util";

import { ReturnHelper } from "../../misc-functions";
import { ReturnSuccess } from "../../types";
import { cacheData, CacheHandled } from "../cache";

import { collectData } from "./collect-data";
import { getPathToJar } from "./download";
import { checkJavaPath, runGenerator } from "./extract-data";

const mkdtmpAsync = promisify(fs.mkdtemp);

/**
 * Will throw an error if something goes wrong.
 * Steps:
 * - Check if enabled in settings. ✓
 * - Check versions manifest. Compare with cached if available ✓
 *  - At the same time, check if java is installed ✓
 * - Get single version information ✓
 * - Download the jar into a temporary folder ✓
 * - Run the exposed data generator. ✓
 * - Collect the data exposed
 *  - Blocks and states
 *  - Items
 *  - (Entities)?
 *  - Commands
 *  - Advancements, recipes, structures, tags, etc
 * - Cache that data
 * - Return the data
 */
export async function collectGlobalData(
    currentversion: string = ""
): Promise<ReturnSuccess<CacheHandled> | undefined> {
    if (mcLangSettings.data.enabled) {
        const javaPath = await checkJavaPath();
        mcLangLog(`Using java at path ${javaPath}`);
        const dir = await mkdtmpAsync(path.join(tmpdir(), "mcfunction"));
        const jarInfo = await getPathToJar(dir, currentversion);
        if (jarInfo) {
            mcLangLog(`Running generator`);
            const datadir = await runGenerator(javaPath, dir, jarInfo.jarPath);
            mcLangLog("Generator Finished, collecting data");
            const helper = new ReturnHelper();
            const data = await collectData(jarInfo.version, datadir);
            mcLangLog("Data collected, caching data");
            await cacheData(data.data);
            mcLangLog("Caching complete");
            return helper.return(data);
        } else {
            return undefined;
        }
    } else {
        throw new Error(
            "Data Obtainer disabled in settings. To obtain data automatically, please enable it."
        );
    }
}
