import * as fs from "fs";
import * as path from "path";
import { shim } from "util.promisify";
shim();
import { promisify } from "util";

import { DATAFOLDER } from "../../consts";
import { ReturnHelper } from "../../misc_functions";
import { ReturnSuccess } from "../../types";
import { getNamespaceResources } from "../datapack_resources";
import { BlocksPropertyInfo, CommandTree, GlobalData } from "../types";
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
        getItems(dataDir),
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
async function getResources(
    dataDir: string
): Promise<DataSaveResult<"resources">> {
    const namespacePath = path.join(dataDir, DATAFOLDER);
    const resources = await getNamespaceResources(
        "minecraft",
        namespacePath,
        undefined
    );
    return ["resources", resources.data];
}
//#endregion
//#region Items
async function getItems(dataDir: string): Promise<DataSaveResult<"items">> {
    const itemsData: Dictionary<{ protocol_id: number }> = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "items.json")
        )).toString()
    );
    return ["items", Object.keys(itemsData)];
}
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
//#endregion

//#region Blocks
async function getBlocks(dataDir: string): Promise<DataSaveResult<"blocks">> {
    const blocksData: BlocksJson = JSON.parse(
        (await readFileAsync(
            path.join(dataDir, "reports", "blocks.json")
        )).toString()
    );
    return ["blocks", cleanBlocks(blocksData)];
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

interface BlocksJson {
    [id: string]: {
        properties?: {
            [id: string]: string[];
        };
    };
}
//#endregion
