import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import { typed_keys } from "../misc_functions/third_party/typed_keys";
import { WorkspaceSecurity } from "../types";
import { GlobalData } from "./types";

const cacheFolder = path.join(__dirname, "cache");

const cacheFileNames: { [K in keyof GlobalData]: string; } = {
    blocks: "blocks.json",
    commands: "commands.json",
    items: "items.json",
    meta_info: "meta_info.json",
    resources: "resources.json",
};

export async function readCache(): Promise<GlobalData> {
    const data: GlobalData = {} as GlobalData;
    const keys = typed_keys(cacheFileNames);
    const promises: Array<Thenable<GlobalData[keyof GlobalData]>> = [];
    for (const key of keys) {
        promises.push(readJSON<GlobalData[typeof key]>(path.join(cacheFolder, cacheFileNames[key])));
    }
    const results = await Promise.all(promises);
    for (const key of keys) {
        // @ts-ignore This is allowed
        data[key] = results.shift();
    }
    return data;
}

export async function cacheData(data: GlobalData) {
    try {
        await promisify(fs.mkdir)(cacheFolder, "777");
    } catch (_) {
        // Don't use the error
    }
    const keys: Array<keyof typeof cacheFileNames> = typed_keys(cacheFileNames);
    const promises: Array<Thenable<void>> = [];
    for (const key of keys) {
        promises.push(writeJSON(path.join(cacheFolder, cacheFileNames[key]), data[key]));
    }
    await Promise.all(promises);
    return;
}

export async function storeSecurity(security: WorkspaceSecurity) {
    await saveFileAsync(path.join(cacheFolder, "security.json"), JSON.stringify(security));
}

export async function readSecurity(): Promise<WorkspaceSecurity> {
    return JSON.parse((await readFileAsync(path.join(cacheFolder, "security.json"))).toString());
}

//#region Helper Functions
const readFileAsync = promisify(fs.readFile);
async function readJSON<T>(filePath: string): Promise<T> {
    const buffer = await readFileAsync(filePath);
    return JSON.parse(buffer.toString());
}
const saveFileAsync = promisify(fs.writeFile);
async function writeJSON(filepath: string, o: object) {
    await saveFileAsync(filepath, JSON.stringify(o));
}

//#endregion
