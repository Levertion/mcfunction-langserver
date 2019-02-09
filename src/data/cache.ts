import * as path from "path";

import {
    mkdirAsync,
    readJSONRaw,
    saveFileAsync,
    writeJSON
} from "../misc-functions/promisified-fs";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import { WorkspaceSecurity } from "../types";
import { Cacheable, RegistriesData } from "./types";

if (!process.env.MCFUNCTION_CACHE_DIR) {
    throw new Error("Environment variable MCFUNCTION_CACHE_DIR must be set");
}
export const cacheFolder = process.env.MCFUNCTION_CACHE_DIR;

const cacheFileNames: Record<Exclude<keyof Cacheable, "registries">, string> = {
    blocks: "blocks.json",
    commands: "commands.json",
    meta_info: "meta_info.json",
    resources: "resources.json"
};

const registriesCacheFile = "registries.json";

export async function readCache(): Promise<Cacheable> {
    const data: Cacheable = {} as Cacheable;
    const keys = typed_keys(cacheFileNames);
    await Promise.all([
        ...keys.map(async key => {
            const cacheDir = cacheFileNames[key];
            data[key] = await readJSONRaw<Cacheable[typeof key]>(
                path.join(cacheFolder, cacheDir)
            );
        }),
        readRegistries(data)
    ]);
    return data;
}

type CachedRegistries = Record<keyof RegistriesData, string[]>;

async function readRegistries(data: Cacheable): Promise<void> {
    const read = await readJSONRaw<CachedRegistries>(
        path.join(cacheFolder, registriesCacheFile)
    );
    data.registries = {} as any;
    for (const key of typed_keys(read)) {
        data.registries[key] = new Set(read[key]);
    }
}

export async function cacheData(data: Cacheable): Promise<void> {
    try {
        await mkdirAsync(cacheFolder, "777");
    } catch (_) {
        // Don't use the error, which is normally thrown if the folder already exists
    }
    const keys: Array<keyof typeof cacheFileNames> = typed_keys(cacheFileNames);
    await Promise.all([
        ...keys.map(async key =>
            writeJSON(path.join(cacheFolder, cacheFileNames[key]), data[key])
        ),
        cacheRegistry(data.registries)
    ]);
}

async function cacheRegistry(registries: RegistriesData): Promise<void> {
    const toWrite = {} as CachedRegistries;
    for (const key of typed_keys(registries)) {
        toWrite[key] = [...registries[key]];
    }
    await writeJSON(path.join(cacheFolder, registriesCacheFile), toWrite);
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
