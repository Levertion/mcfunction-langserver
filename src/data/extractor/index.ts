import * as fs from "fs";
import { tmpdir } from "os";
import * as path from "path";
import { shim } from "util.promisify";
shim();
import { promisify } from "util";

import { ReturnHelper } from "../../misc-functions";
import { ReturnSuccess } from "../../types";
import { cacheData } from "../cache";
import { GlobalData } from "../types";
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
): Promise<ReturnSuccess<GlobalData>> {
    if (mcLangSettings.data.enabled) {
        const javaPath = await checkJavaPath();
        const dir = await mkdtmpAsync(path.join(tmpdir(), "mcfunction"));
        const jarInfo = await getPathToJar(dir, currentversion);
        const datadir = await runGenerator(javaPath, dir, jarInfo.jarPath);
        mcLangLog("Generator Finished");
        const helper = new ReturnHelper();
        const data = await collectData(jarInfo.version, datadir);
        await cacheData(data.data);
        return helper.mergeChain(data).succeed(data.data);
    } else {
        throw new Error(
            "Data Obtainer disabled in settings. To obtain data automatically, please enable it."
        );
    }
}
