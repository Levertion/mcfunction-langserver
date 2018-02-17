import * as fs from "fs";
import { tmpdir } from "os";
import * as path from "path";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import { cacheData } from "../cache_management";
import { GlobalData } from "../types";
import { collectData } from "./collect_data";
import { getPathToJar } from "./download";
import { checkJavaPath, runGenerator } from "./extract_data";

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
export async function collectGlobalData(currentversion?: string): Promise<GlobalData> {
    if (mcLangSettings.data.enabled) {
        const javaPath = await checkJavaPath();
        const dir = await mkdtmpAsync(path.join(tmpdir(), "mcfunction"));
        currentversion = currentversion || "";
        const jarInfo = await getPathToJar(dir, currentversion);
        const datadir = await runGenerator(javaPath, dir, jarInfo.jarPath);
        mcLangLog("Generator Finished");
        const data = await collectData(jarInfo.version, datadir);
        await cacheData(data);
        return data;
    } else {
        throw new Error("Data Obtainer disabled in settings. To obtain data automatically, please enable it.");
    }
}

const mkdtmpAsync = promisify(fs.mkdtemp);
