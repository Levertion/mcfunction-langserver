import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { getNamespaceResources } from "../datapack_resources";
import { BlockStateInfo, CommandTree, GlobalData } from "../types";

type DataSaveResult<T extends keyof GlobalData> = [T, GlobalData[T]];

export async function collectData(version: string, dataDir: string): Promise<GlobalData> {
    const result: GlobalData = { meta_info: { version } } as GlobalData;
    const cleanups = await Promise.all(
        [
            getBlocks(dataDir),
            getItems(dataDir),
            getCommands(dataDir),
            getResources(dataDir),
        ],
    );
    for (const dataType of cleanups) {
        result[dataType[0]] = dataType[1];
    }
    return result;
}

//#region Resources
async function getResources(dataDir: string): Promise<DataSaveResult<"resources">> {
    const namespacePath = path.join(dataDir, "data");
    return ["resources", await getNamespaceResources("minecraft", namespacePath)];
}
//#endregion
//#region Items
async function getItems(dataDir: string): Promise<DataSaveResult<"items">> {
    const itemsData: { [key: string]: { protocol_id: number } } = JSON.parse((await readFileAsync(
        path.join(dataDir, "reports", "items.json"))).toString());
    return ["items", Object.keys(itemsData)];
}
async function getCommands(dataDir: string): Promise<DataSaveResult<"commands">> {
    const tree: CommandTree = JSON.parse((await readFileAsync(
        path.join(dataDir, "reports", "commands.json"))).toString());
    return ["commands", tree];
}
//#endregion

//#region Blocks
async function getBlocks(dataDir: string): Promise<DataSaveResult<"blocks">> {
    const blocksData: BlocksJson = JSON.parse((await readFileAsync(
        path.join(dataDir, "reports", "blocks.json"))).toString());
    return ["blocks", cleanBlocks(blocksData)];
}

function cleanBlocks(blocks: BlocksJson): BlockStateInfo {
    const result: BlockStateInfo = {};
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
        },
    };
}
//#endregion

const readFileAsync = promisify(fs.readFile);
