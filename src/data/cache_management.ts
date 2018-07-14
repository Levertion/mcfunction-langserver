import * as path from "path";

import {
    mkdirAsync,
    readJSONRaw,
    saveFileAsync,
    writeJSON
} from "../misc_functions/promisified_fs";
import { typed_keys } from "../misc_functions/third_party/typed_keys";
import { WorkspaceSecurity } from "../types";
import { Cacheable, GlobalData } from "./types";

const cacheFolder = path.join(__dirname, "cache");

const cacheFileNames: { [K in keyof Cacheable]: string } = {
    blocks: "blocks.json",
    commands: "commands.json",
    items: "items.json",
    meta_info: "meta_info.json",
    resources: "resources.json"
};

export async function readCache(): Promise<Cacheable> {
    const data: Cacheable = {} as Cacheable;
    const keys = typed_keys(cacheFileNames);
    await Promise.all(
        keys.map(async key => {
            data[key] = await readJSONRaw<Cacheable[typeof key]>(
                path.join(cacheFolder, cacheFileNames[key])
            );
        })
    );
    return data;
}

export async function cacheData(data: GlobalData): Promise<void> {
    try {
        await mkdirAsync(cacheFolder, "777");
    } catch (_) {
        // Don't use the error, which is normally thrown if the folder doesn't exist
    }
    const keys: Array<keyof typeof cacheFileNames> = typed_keys(cacheFileNames);
    await Promise.all(
        keys.map(async key =>
            writeJSON(path.join(cacheFolder, cacheFileNames[key]), data[key])
        )
    );
    return;
}

export async function storeSecurity(
    security: WorkspaceSecurity
): Promise<void> {
    await saveFileAsync(
        path.join(cacheFolder, "security.json"),
        JSON.stringify(security)
    );
}

export async function readSecurity(): Promise<WorkspaceSecurity> {
    try {
        return readJSONRaw(path.join(cacheFolder, "security.json"));
    } catch (error) {
        return {};
    }
}
