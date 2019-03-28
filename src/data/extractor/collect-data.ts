import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { DATAFOLDER } from "../../consts";
import { convertToID, ReturnHelper } from "../../misc-functions";
import { IDMap } from "../../misc-functions/id-map";
import { typed_keys } from "../../misc-functions/third_party/typed-keys";
import {
    CommandTree,
    RegistryNames,
    Resources,
    ReturnSuccess
} from "../../types";
import { CacheHandled } from "../cache";
import { getNamespaceResources } from "../datapack-resources";
import { createRegistryMap, createResourceMap, createTagMap } from "../maps";

import { runMapFunctions } from "./mapfunctions";
const readFileAsync = promisify(fs.readFile);

/**
 * Extract the globally useful data from the minecraft jar in the directory datadir
 */
export async function collectData(
    version: string,
    dataDir: string
): Promise<ReturnSuccess<CacheHandled>> {
    const helper = new ReturnHelper();
    const result: CacheHandled = { data_info: { version } } as CacheHandled;
    await Promise.all([
        getBlocks(dataDir).then(blocks => (result.blocks = blocks)),
        getRegistries(dataDir).then(
            registries => (result.registries = registries)
        ),
        getCommands(dataDir).then(commands => (result.commands = commands)),
        getResources(dataDir).then(
            resourceInfo => (result.resources = resourceInfo)
        )
    ]);
    const resources = await runMapFunctions(result.resources, result, dataDir);
    return helper
        .mergeChain(resources)
        .succeed({ ...result, resources: resources.data });
}

async function getRegistries(
    dataDir: string
): Promise<CacheHandled["registries"]> {
    interface ProtocolID {
        protocol_id: number;
    }

    interface Registries extends Record<RegistryNames, Registry> {}
    interface Registry<T = {}> extends ProtocolID {
        entries: {
            [key: string]: T & ProtocolID;
        };
    }

    const registries: Registries = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "registries.json")
        )).toString()
    );
    const result = {} as CacheHandled["registries"];
    for (const key of typed_keys(registries)) {
        const registry = registries[key];
        if (registry.entries) {
            const set = createRegistryMap();
            for (const entry of Object.keys(registry.entries)) {
                set.add(convertToID(entry));
            }
            result[key] = set;
        }
    }
    return result;
}

async function getResources(
    dataDir: string
): Promise<CacheHandled["resources"]> {
    const dataFolder = path.join(dataDir, DATAFOLDER);
    const resources: Resources = {
        advancements: createResourceMap("Advancement"),
        block_tags: createTagMap("Block tag"),
        entity_tags: createTagMap("Entity tag"),
        fluid_tags: createTagMap("Fluid tags"),
        function_tags: createTagMap("Function Tags"),
        functions: createResourceMap("Function"),
        item_tags: createTagMap("Item Tag"),
        loot_tables: createResourceMap("Loot Table"),
        recipes: createResourceMap("Recipe"),
        structures: createResourceMap("Structure")
    };
    await getNamespaceResources("minecraft", dataFolder, undefined, resources);
    return resources;
}

async function getCommands(dataDir: string): Promise<CacheHandled["commands"]> {
    const tree: CommandTree = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "commands.json")
        )).toString()
    );
    return tree;
}

async function getBlocks(dataDir: string): Promise<CacheHandled["blocks"]> {
    interface BlocksJson {
        [id: string]: {
            properties?: {
                [id: string]: string[];
            };
        };
    }

    const blocksData: BlocksJson = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "blocks.json")
        )).toString()
    );
    const result: CacheHandled["blocks"] = new IDMap();
    for (const block of Object.keys(blocksData)) {
        const props = blocksData[block];
        if (props.properties) {
            const propsMap = Object.entries(props.properties).map<
                [string, Set<string>]
            >(v => [v[0], new Set(v[1])]);
            result.add(convertToID(block), new Map(propsMap));
        }
    }
    return result;
}
