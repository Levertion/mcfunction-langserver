import * as fs from "fs";
import * as path from "path";
import { shim } from "util.promisify";
shim();
import { promisify } from "util";
import { ReturnedInfo } from "../types";
import { createJSONFileError } from "./file_errors";
import { ReturnHelper } from "./returnhelper";

export const readFileAsync = promisify(fs.readFile);
export const saveFileAsync = promisify(fs.writeFile);
export const mkdirAsync = promisify(fs.mkdir);
export const readDirAsync = promisify(fs.readdir);
export const statAsync = promisify(fs.stat);

export async function readJSONRaw<T>(filePath: string): Promise<T> {
    const buffer = await readFileAsync(filePath);
    return JSON.parse(buffer.toString());
}

export async function writeJSON(filepath: string, o: object): Promise<void> {
    await saveFileAsync(filepath, JSON.stringify(o));
}

export async function readJSON<T>(filePath: string): Promise<ReturnedInfo<T>> {
    const helper = new ReturnHelper();
    let buffer: Buffer;
    try {
        buffer = await readFileAsync(filePath);
    } catch (error) {
        mcLangLog(`File at '${filePath}' not available: ${error}`);
        return helper.fail();
    }
    try {
        const result = JSON.parse(buffer.toString());
        return helper.succeed<T>(result);
    } catch (e) {
        return helper.addMisc(createJSONFileError(filePath, e)).fail();
    }
}

export async function walkDir(currentPath: string): Promise<string[]> {
    const subFolders: string[] = [];
    try {
        subFolders.push(...(await readDirAsync(currentPath)));
    } catch (error) {
        return [];
    }
    const promises = subFolders.map(async sub => {
        try {
            const files: string[] = [];
            const subFile = path.join(currentPath, sub);
            if ((await statAsync(subFile)).isDirectory()) {
                files.push(...(await walkDir(subFile)));
            } else {
                files.push(subFile);
            }
            return files;
        } catch (error) {
            return [];
        }
    });
    const results = await Promise.all(promises);
    return ([] as string[]).concat(...results);
}
