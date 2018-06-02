import * as fs from "fs";
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
