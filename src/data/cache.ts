import * as path from "path";

import { SerializedIDMap } from "../misc-functions/id-map";
import {
    mkdirAsync,
    readJSONRaw,
    saveFileAsync,
    writeJSON
} from "../misc-functions/promisified-fs";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import {
    Blocks,
    CommandData,
    CommandTree,
    RegistryData,
    RegistryNames,
    Resources,
    ResourcesMap,
    WorkspaceSecurity
} from "../types";

import {
    createBlockMap,
    createRegistryMap,
    createResourceMap,
    createTagMap
} from "./maps";

if (!process.env.MCFUNCTION_CACHE_DIR) {
    throw new Error("Environment variable MCFUNCTION_CACHE_DIR must be set");
}
export const cacheFolder = process.env.MCFUNCTION_CACHE_DIR;

export type CacheHandled = Pick<
    CommandData,
    "blocks" | "commands" | "data_info" | "registries" | "resources"
>;

type CachedRegistries = Record<RegistryNames, SerializedIDMap<undefined>>;
type CachedResources = Record<keyof Resources, SerializedIDMap<any>>;

const caches = {
    blocks: "blocks.json",
    commands: "commands.json",
    data_info: "data_info.json",
    registries: "registries.json",
    resources: "resources.json"
};
for (const key of typed_keys(caches)) {
    caches[key] = path.join(cacheFolder, caches[key]);
}

export async function readCache(): Promise<CacheHandled> {
    const data: CacheHandled = {} as CacheHandled;
    await Promise.all([
        readJSONRaw<CommandTree>(caches.commands).then(
            commands => (data.commands = commands)
        ),
        readJSONRaw<CommandData["data_info"]>(caches.data_info).then(
            dataInfo => (data.data_info = dataInfo)
        ),
        readBlocks().then(blocks => (data.blocks = blocks)),
        readRegistries().then(registries => (data.registries = registries)),
        readResources().then(resources => (data.resources = resources))
    ]);
    return data;
}

type SerializedBlocks = Array<[string, string[]]>;

async function readBlocks(): Promise<Blocks> {
    const blocks = await readJSONRaw<SerializedIDMap<SerializedBlocks>>(
        caches.blocks
    );
    const result = createBlockMap();
    result.addSerialized<SerializedBlocks>(
        blocks,
        values =>
            new Map(
                values.map<[string, Set<string>]>(([k, v]) => [k, new Set(v)])
            )
    );

    return result;
}

async function readRegistries(): Promise<RegistryData> {
    const read = await readJSONRaw<CachedRegistries>(caches.registries);
    const result: RegistryData = {} as any;
    for (const key of typed_keys(read)) {
        const newSet = createRegistryMap();
        newSet.addSerialized(read[key]);
        result[key] = newSet;
    }
    return result;
}

const resourceNames: Partial<Record<keyof Resources, string>> = {
    block_tags: "Block Tags",
    entity_tags: "Entity Tags",
    fluid_tags: "Fluid Tags",
    function_tags: "Function Tags",
    item_tags: "Item Tags"
};

async function readResources(): Promise<Resources> {
    const read = await readJSONRaw<CachedResources>(caches.registries);
    const result: Resources = {} as any;
    for (const key of typed_keys(read)) {
        switch (key) {
            case "block_tags":
            case "entity_tags":
            case "fluid_tags":
            case "function_tags":
            case "item_tags":
                const newTags = createTagMap(resourceNames[key] || key);
                newTags.addSerialized(
                    read[key],
                    value => new Map([[undefined, value]])
                );
                result[key] = newTags;
                break;

            default:
                const newSet = createResourceMap(resourceNames[key] || key);
                newSet.addSerialized<any>(
                    read[key],
                    value => new Map([undefined, value])
                );
                result[key] = newSet;
        }
    }
    return result;
}

export async function cacheData(data: CacheHandled): Promise<void> {
    try {
        await mkdirAsync(cacheFolder, "777");
    } catch (_) {
        // Don't use the error, which is normally thrown if the folder already exists
    }
    const { blocks, commands, data_info, registries, resources } = data;
    await Promise.all([
        cacheRegistry(registries),
        cacheResources(resources),
        writeJSON(caches.data_info, data_info),
        writeJSON(caches.commands, commands),
        cacheBlocks(blocks)
    ]);
}

async function cacheRegistry(
    registries: CacheHandled["registries"]
): Promise<void> {
    const toWrite = {} as CachedRegistries;
    for (const key of typed_keys(registries)) {
        toWrite[key] = registries[key].serialize();
    }
    await writeJSON(caches.registries, toWrite);
}

async function cacheResources(
    resources: CacheHandled["resources"]
): Promise<void> {
    const toWrite = {} as CachedResources;
    for (const key of typed_keys(resources)) {
        const value: ResourcesMap<any, any> = resources[key];
        toWrite[key] = value.serialize(
            map => map.has(undefined) && map.get(undefined)
        );
    }
    await writeJSON(caches.resources, toWrite);
}
async function cacheBlocks(blocks: CacheHandled["blocks"]): Promise<void> {
    await writeJSON(
        caches.blocks,
        blocks.serialize<SerializedBlocks>(a =>
            [...a].map<[string, string[]]>(v => [v[0], [...v[1]]])
        )
    );
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
