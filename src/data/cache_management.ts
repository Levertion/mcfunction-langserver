import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { GlobalData } from "./types";

const cacheFolder = path.join(__dirname, "cache");

const cacheFileNames: {[K in keyof GlobalData]: string; } = {
    commands: "commands.json",
};

export async function readCache(): Promise<GlobalData> {
    const data: GlobalData = {} as GlobalData;
    // @ts-ignore The result from Object.keys is compa
    const keys: Array<keyof typeof cacheFileNames> = Object.keys(cacheFileNames);
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
    // @ts-ignore The result from Object.keys is compatible
    const keys: Array<keyof typeof cacheFileNames> = Object.keys(cacheFileNames);
    const promises: Array<Thenable<void>> = [];
    for (const key of keys) {
        promises.push(writeJSON(path.join(cacheFolder, cacheFileNames[key]), data[key]));
    }
    await Promise.all(promises);
    return;
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
