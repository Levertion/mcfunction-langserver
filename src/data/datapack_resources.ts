import * as fs from "fs";
import * as path from "path";
import { shim } from "util.promisify";
shim();
import { promisify } from "util";

import { typed_keys } from "../misc_functions/third_party/typed_keys";
import { Datapack, MinecraftResource, NamespaceData } from "./types";

//#region Promisifed Functions
const readDirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const statAsync = promisify(fs.stat);
const existsAsync = promisify<string, boolean>((location, cb) => {
    fs.exists(location, result => {
        cb(undefined as any, result);
    });
});
//#endregion

interface ResourceInfo<U = string> {
    extension: string;
    path: [U] | string[]; // Custom tuple allows autocomplete mostly.
    readJson?: boolean;
}

const resourceTypes: { [T in keyof NamespaceData]-?: ResourceInfo<T> } = {
    advancements: { extension: ".json", path: ["advancements"] },
    block_tags: {
        extension: ".json",
        path: ["tags", "blocks"],
        readJson: true
    },
    function_tags: { extension: ".json", path: ["tags", "functions"] },
    functions: { extension: ".mcfunction", path: ["functions"] },
    item_tags: { extension: ".json", path: ["tags", "items"] },
    loot_tables: { extension: ".json", path: ["loot_tables"] },
    recipes: { extension: ".json", path: ["recipes"] },
    structures: { extension: ".nbt", path: ["structures"] }
};

export async function getNamespaceResources(
    namespace: string,
    location: string
): Promise<NamespaceData> {
    const result: NamespaceData = {};
    const namespaceFolder = path.join(location, "data", namespace);
    const subDirs = await subDirectories(namespaceFolder);
    for (const type of typed_keys(resourceTypes)) {
        const resourceInfo = resourceTypes[type];
        if (subDirs.indexOf(resourceInfo.path[0]) === -1) {
            continue;
        }
        const dataContents = path.join(namespaceFolder, ...resourceInfo.path);
        if (
            resourceInfo.path.length > 1 &&
            !(await existsAsync(dataContents))
        ) {
            continue;
        }
        const files = await walkDir(dataContents);
        const nameSpaceContents = result[type] || [];
        for (const file of files) {
            const realExtension = path.extname(file);
            if (realExtension === resourceInfo.extension) {
                const internalUri = path.relative(dataContents, file);
                const newResource: MinecraftResource = {
                    resource_name: {
                        namespace,
                        path: internalUri
                            .slice(0, -realExtension.length)
                            .replace(new RegExp(`\\${path.sep}`, "g"), "/")
                    }
                };
                try {
                    if (!!resourceInfo.readJson) {
                        // @ts-ignore The resources are only officially allowed to be MinecraftResources.
                        // However, they are cast to DataResources at a later time if applicable.
                        newResource.data = JSON.parse(
                            await readFileAsync(file)
                        );
                    }
                } catch (error) {
                    mcLangLog(
                        `File '${file}' has invalid json structure: '${JSON.stringify(
                            error
                        )}'`
                    );
                }
                nameSpaceContents.push(newResource);
            } else {
                mcLangLog(
                    `File '${file}' has the wrong extension: Expected ${
                        resourceInfo.extension
                    }, got ${realExtension}.`
                );
                continue;
            }
        }
        result[type] = nameSpaceContents;
    }
    return result;
}

export async function getDatapacks(dataLocation: string): Promise<Datapack[]> {
    const datapackNames = await subDirectories(dataLocation);
    const promises = datapackNames.map(
        async (packName): Promise<Datapack> => {
            const packFolder = path.join(dataLocation, packName);
            const dataFolder = path.join(packFolder, "data");
            const datapackNamespaces = await subDirectories(dataFolder);
            const result: Datapack = { namespaces: {}, path: packFolder };
            await Promise.all(
                datapackNamespaces.map(async namespace => {
                    result.namespaces[namespace] = await getNamespaceResources(
                        namespace,
                        packFolder
                    );
                })
            );
            return result;
        }
    );
    return Promise.all(promises);
}

async function walkDir(currentPath: string): Promise<string[]> {
    const subFolders: string[] = [];
    try {
        subFolders.push(...(await readDirAsync(currentPath)));
    } catch (error) {
        return [];
    }
    const promises = subFolders.map(async sub => {
        try {
            const files: string[] = [];
            const subFile = path.join(currentPath, sub);
            if ((await statAsync(subFile)).isDirectory()) {
                files.push(...(await walkDir(subFile)));
            } else {
                files.push(subFile);
            }
            return files;
        } catch (error) {
            return [];
        }
    });
    const results = await Promise.all(promises);
    return ([] as string[]).concat(...results);
}

async function subDirectories(baseFolder: string): Promise<string[]> {
    let files: string[] = [];
    try {
        files = await readDirAsync(baseFolder);
    } catch (error) {
        return [];
    }
    const promises = files.map<Promise<boolean>>(async name => {
        try {
            return (await statAsync(path.join(baseFolder, name))).isDirectory();
        } catch (error) {
            return false;
        }
    });
    const results = await Promise.all(promises);
    return files.filter((_, i) => results[i]);
}
