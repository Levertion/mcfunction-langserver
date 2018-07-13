import * as path from "path";

import { DATAFOLDER, MCMETAFILE, SLASH } from "../consts";
import { resourceTypes, ReturnHelper } from "../misc_functions";
import { createExtensionFileError } from "../misc_functions/file_errors";
import {
    readDirAsync,
    readJSON,
    statAsync,
    walkDir
} from "../misc_functions/promisified_fs";
import { typed_keys } from "../misc_functions/third_party/typed_keys";
import { ReturnSuccess } from "../types";
import {
    Datapack,
    DataPackID,
    McmetaFile,
    MinecraftResource,
    PacksInfo,
    Resources
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
                    if (!!resourceInfo.readJson) {
                        const jsonData = await readJSON(file);
                        if (helper.merge(jsonData)) {
                            // @ts-ignore The resources are only officially allowed to be MinecraftResources.
                            // However, they are cast to DataResources at a later time if applicable.
                            newResource.data = jsonData.data;
                        }
                    }
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
    id: DataPackID
): Promise<ReturnSuccess<Datapack>> {
    const helper = new ReturnHelper();
    const dataFolder = path.join(packFolder, DATAFOLDER);
    const [mcmeta, packResources] = await Promise.all([
        readJSON<McmetaFile>(path.join(packFolder, MCMETAFILE)),
        getPackResources(dataFolder, id)
    ]);
    const result: Datapack = { id, data: packResources.data };
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
    location: string
): Promise<ReturnSuccess<PacksInfo>> {
    const packNames = await subDirectories(location);
    const helper = new ReturnHelper();
    const packs = [...packNames.entries()];
    const result: PacksInfo = { location, packnamesmap: {}, packs: {} };
    const promises: Array<Promise<void>> = packs.map(
        async ([packID, packName]) => {
            const loc = path.join(location, packName);
            const packData = await buildDataPack(loc, packID);
            helper.merge(packData);
            result.packs[packID] = packData.data;
            result.packnamesmap[packName] = packID;
        }
    );
    await Promise.all(promises);
    return helper.succeed(result);
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
