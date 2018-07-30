import * as path from "path";

import {
    mkdirAsync,
    readJSONRaw,
    saveFileAsync,
    writeJSON
} from "../misc-functions/promisified-fs";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import { WorkspaceSecurity } from "../types";
import { GlobalData } from "./types";

const cacheFolder = path.join(__dirname, "cache");

const cacheFileNames: { [K in keyof GlobalData]: string } = {
    blocks: "blocks.json",
    commands: "commands.json",
    items: "items.json",
    meta_info: "meta_info.json",
    resources: "resources.json"
};

export async function readCache(): Promise<GlobalData> {
    const data: GlobalData = {} as GlobalData;
    const keys = typed_keys(cacheFileNames);
    const promises: Array<Thenable<GlobalData[keyof GlobalData]>> = [];
    for (const key of keys) {
        promises.push(
            readJSONRaw<GlobalData[typeof key]>(
                path.join(cacheFolder, cacheFileNames[key])
            )
        );
    }
    const results = await Promise.all(promises);
    for (const key of keys) {
        // @ts-ignore This is allowed
        data[key] = results.shift();
    }
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
        return await readJSONRaw(path.join(cacheFolder, "security.json"));
    } catch (error) {
        return {};
    }
}
