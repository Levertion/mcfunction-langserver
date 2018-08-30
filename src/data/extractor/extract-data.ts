import { execFile } from "child_process";
import * as path from "path";
import { promisify } from "util";
const execFileAsync = promisify(execFile);

/**
 * Get the command used to execute a java version
 */
export async function checkJavaPath(): Promise<string> {
    const javaPath = mcLangSettings.data.javaPath || "java";
    try {
        await execFileAsync(javaPath, ["-version"], { env: process.env });
        return javaPath;
    } catch (error) {
        throw new Error(
            `Could not find Java executable. Got message: '${error}'`
        );
    }
}

export async function runGenerator(
    javapath: string,
    tempdir: string,
    jarpath: string
): Promise<string> {
    const resultFolder = path.join(tempdir, "generated");
    await execFileAsync(javapath, [
        "-cp",
        jarpath,
        "net.minecraft.data.Main",
        "--output",
        resultFolder,
        "--all"
    ]);
    return resultFolder;
}
