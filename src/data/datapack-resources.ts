import * as path from "path";

import { DATAFOLDER, MCMETAFILE, SLASH, SLASHREPLACEREGEX } from "../consts";
import { resourceTypes, ReturnHelper } from "../misc-functions";
import { createExtensionFileError } from "../misc-functions/file-errors";
import {
    readDirAsync,
    readJSON,
    statAsync,
    walkDir
} from "../misc-functions/promisified-fs";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import {
    Datapack,
    DataPackID,
    DataPackReference,
    McmetaFile,
    Resources,
    ReturnSuccess,
    WorldInfo
} from "../types";

import { loadWorldNBT } from "./nbt/nbt-cache";

export async function getNamespaceResources(
    namespace: string,
    dataFolder: string,
    id: DataPackReference,
    accumulator: Resources
): Promise<ReturnSuccess<undefined>> {
    const initialContents: Array<[DataPackReference, undefined]> = [
        [id, undefined]
    ];
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
                    const newResource = {
                        namespace,
                        path: internalUri
                            .slice(0, -realExtension.length)
                            .replace(SLASHREPLACEREGEX, SLASH)
                    };
                    accumulator[type].add(
                        newResource,
                        new Map(initialContents)
                    );
                })
            );
        })
    );
    return helper.succeed();
}

async function buildDataPack(
    packFolder: string,
    id: DataPackID,
    packName: string
): Promise<ReturnSuccess<Datapack>> {
    const helper = new ReturnHelper();
    const mcmeta = await readJSON<McmetaFile>(
        path.join(packFolder, MCMETAFILE)
    );
    const result: Datapack = { id, name: packName };
    if (helper.merge(mcmeta)) {
        result.mcmeta = mcmeta.data;
    }
    return helper.succeed(result);
}

async function getPackResources(
    dataFolder: string,
    id: DataPackID,
    resources: Resources
): Promise<ReturnSuccess<undefined>> {
    const helper = new ReturnHelper();
    const namespaces = await subDirectories(dataFolder);
    await Promise.all(
        namespaces.map(async namespace => {
            const result = await getNamespaceResources(
                namespace,
                dataFolder,
                id,
                resources
            );
            helper.merge(result);
        })
    );
    return helper.succeed();
}

export async function getPacksInfo(
    datapacksFolder: string,
    resources: Resources
): Promise<ReturnSuccess<WorldInfo>> {
    const packNames = await subDirectories(datapacksFolder);
    const helper = new ReturnHelper();
    const packs = [...packNames.entries()];
    const nbt = await loadWorldNBT(path.join(datapacksFolder, ".."));
    const result: WorldInfo = {
        datapacksFolder,
        nbt,
        packnamesmap: new Map(),
        packs: new Map()
    };
    const promises: Array<Promise<void>> = packs.map(
        async ([packID, packName]) => {
            const loc = path.join(datapacksFolder, packName);
            const [packData] = await Promise.all([
                buildDataPack(loc, packID, packName),
                getPackResources(path.join(loc, DATAFOLDER), packID, resources)
            ]);
            helper.merge(packData);
            result.packs.set(packID, packData.data);
            result.packnamesmap.set(packName, packID);
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
