import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { DATAFOLDER } from "../../consts";
import { ReturnHelper } from "../../misc-functions";
import { typed_keys } from "../../misc-functions/third_party/typed-keys";
import { ReturnSuccess } from "../../types";
import { getNamespaceResources } from "../datapack-resources";
import {
    BlocksPropertyInfo,
    CommandTree,
    GlobalData,
    RegistriesData,
    RegistryNames
} from "../types";
import { runMapFunctions } from "./mapfunctions";
const readFileAsync = promisify(fs.readFile);

type DataSaveResult<T extends keyof GlobalData> = [T, GlobalData[T]];

export async function collectData(
    version: string,
    dataDir: string
): Promise<ReturnSuccess<GlobalData>> {
    const helper = new ReturnHelper();
    const result: GlobalData = { meta_info: { version } } as GlobalData;
    const cleanups = await Promise.all([
        getBlocks(dataDir),
        getRegistries(dataDir),
        getCommands(dataDir),
        getResources(dataDir)
    ]);
    for (const dataType of cleanups) {
        result[dataType[0]] = dataType[1];
    }
    const resources = await runMapFunctions(result.resources, result, dataDir);
    return helper
        .mergeChain(resources)
        .succeed({ ...result, resources: resources.data });
}

//#region Resources

async function getRegistries(
    dataDir: string
): Promise<DataSaveResult<"registries">> {
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
    const result = {} as RegistriesData;
    for (const key of typed_keys(registries)) {
        const registry = registries[key];
        if (registry.entries) {
            const set = new Set<string>();
            for (const entry of Object.keys(registry.entries)) {
                set.add(entry);
            }
            result[key] = set;
        }
    }
    return ["registries", result];
}

async function getResources(
    dataDir: string
): Promise<DataSaveResult<"resources">> {
    const dataFolder = path.join(dataDir, DATAFOLDER);
    const resources = await getNamespaceResources(
        "minecraft",
        dataFolder,
        undefined
    );
    return ["resources", resources.data];
}
//#endregion

async function getCommands(
    dataDir: string
): Promise<DataSaveResult<"commands">> {
    const tree: CommandTree = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "commands.json")
        )).toString()
    );
    return ["commands", tree];
}

//#region Blocks
async function getBlocks(dataDir: string): Promise<DataSaveResult<"blocks">> {
    interface BlocksJson {
        [id: string]: {
            properties?: {
                [id: string]: string[];
            };
        };
    }

    function cleanBlocks(blocks: BlocksJson): BlocksPropertyInfo {
        const result: BlocksPropertyInfo = {};
        for (const blockName in blocks) {
            if (blocks.hasOwnProperty(blockName)) {
                const blockInfo = blocks[blockName];
                result[blockName] = {};
                if (!!blockInfo.properties) {
                    Object.assign(result[blockName], blockInfo.properties);
                }
            }
        }
        return result;
    }

    const blocksData: BlocksJson = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "blocks.json")
        )).toString()
    );
    return ["blocks", cleanBlocks(blocksData)];
}

//#endregion
