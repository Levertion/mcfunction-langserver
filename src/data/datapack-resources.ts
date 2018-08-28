import * as path from "path";

import { DATAFOLDER, MCMETAFILE, SLASH } from "../consts";
import { resourceTypes, ReturnHelper } from "../misc-functions";
import { createExtensionFileError } from "../misc-functions/file-errors";
import {
    readDirAsync,
    readJSON,
    statAsync,
    walkDir
} from "../misc-functions/promisified-fs";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import { ReturnSuccess } from "../types";
import { mapPacksInfo } from "./extractor/mapfunctions";
import { loadNBT } from "./nbt/nbt-cache";
import {
    Datapack,
    DataPackID,
    GlobalData,
    McmetaFile,
    MinecraftResource,
    Resources,
    WorldInfo
} from "./types";

export async function getNamespaceResources(
    namespace: string,
    dataFolder: string,
    id: DataPackID | undefined,
    result: Resources = {}
): Promise<ReturnSuccess<Resources>> {
    const helper = new ReturnHelper();
    const namespaceFolder = path.join(dataFolder, namespace);
    const subDirs = await subDirectories(namespaceFolder);
    await Promise.all(
        typed_keys(resourceTypes).map(async type => {
            const resourceInfo = resourceTypes[type];
            if (subDirs.indexOf(resourceInfo.path[0]) === -1) {
                return;
            }
            const dataContents = path.join(
                namespaceFolder,
                ...resourceInfo.path
            );
            const files = await walkDir(dataContents);
            if (files.length === 0) {
                return;
            }
            const nameSpaceContents = result[type] || [];
            await Promise.all(
                files.map(async file => {
                    const realExtension = path.extname(file);
                    if (realExtension !== resourceInfo.extension) {
                        helper.addMisc(
                            createExtensionFileError(
                                file,
                                resourceInfo.extension,
                                realExtension
                            )
                        );
                    }
                    const internalUri = path.relative(dataContents, file);
                    const newResource: MinecraftResource = {
                        namespace,
                        pack: id,
                        path: internalUri
                            .slice(0, -realExtension.length)
                            .replace(path.sep, SLASH)
                    };
                    nameSpaceContents.push(newResource);
                })
            );
            result[type] = nameSpaceContents;
        })
    );

    return helper.succeed(result);
}

async function buildDataPack(
    packFolder: string,
    id: DataPackID,
    packName: string
): Promise<ReturnSuccess<Datapack>> {
    const helper = new ReturnHelper();
    const dataFolder = path.join(packFolder, DATAFOLDER);
    const [mcmeta, packResources] = await Promise.all([
        readJSON<McmetaFile>(path.join(packFolder, MCMETAFILE)),
        getPackResources(dataFolder, id)
    ]);
    const result: Datapack = { id, data: packResources.data, name: packName };
    helper.merge(packResources);
    if (helper.merge(mcmeta)) {
        result.mcmeta = mcmeta.data;
    }
    return helper.succeed(result);
}

async function getPackResources(
    dataFolder: string,
    id: DataPackID
): Promise<ReturnSuccess<Resources>> {
    const helper = new ReturnHelper();
    const namespaces = await subDirectories(dataFolder);
    const result: Resources = {};
    await Promise.all(
        namespaces.map(async namespace => {
            const resources = await getNamespaceResources(
                namespace,
                dataFolder,
                id,
                result
            );
            helper.merge(resources);
            return resources.data;
        })
    );
    return helper.succeed(result);
}

export async function getPacksInfo(
    location: string,
    globalData: GlobalData
): Promise<ReturnSuccess<WorldInfo>> {
    const packNames = await subDirectories(location);
    const helper = new ReturnHelper();
    const packs = [...packNames.entries()];
    const nbt = await loadNBT(path.resolve(location, "../"));
    const result: WorldInfo = { location, packnamesmap: {}, packs: {}, nbt };
    const promises: Array<Promise<void>> = packs.map(
        async ([packID, packName]) => {
            const loc = path.join(location, packName);
            const packData = await buildDataPack(loc, packID, packName);
            helper.merge(packData);
            result.packs[packID] = packData.data;
            result.packnamesmap[packName] = packID;
        }
    );
    await Promise.all(promises);
    const otherResult = await mapPacksInfo(result, globalData);
    return helper.mergeChain(otherResult).succeed(otherResult.data);
}

async function subDirectories(baseFolder: string): Promise<string[]> {
    let files: string[] = [];
    try {
        files = await readDirAsync(baseFolder);
    } catch {
        return [];
    }
    const promises = files.map<Promise<boolean>>(async name => {
        try {
            return (await statAsync(path.join(baseFolder, name))).isDirectory();
        } catch {
            return false;
        }
    });
    const results = await Promise.all(promises);
    return files.filter((_, i) => results[i]);
}
