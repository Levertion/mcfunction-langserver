import fs = require("fs");
import path = require("path");
import { promisify } from "util";
import { shim } from "util.promisify";
shim();
import { keys } from "../imported_utils/typed_keys";
export interface Resources {
    datapacks: Array<{
        name: string;
        namespaces: string[];
        packs_folder: string;
    }>;
    data: {
        [namespace: string]: NamespaceResources,
    };
}
export interface NamespaceResources {
    functions?: MinecraftResource[];
    recipes?: MinecraftResource[];
    advancements?: MinecraftResource[];
    loot_tables?: MinecraftResource[];
    structures?: MinecraftResource[];
    block_tags?: MinecraftResource[];
    item_tags?: MinecraftResource[];
    function_tags?: MinecraftResource[];
}

interface MinecraftResource {
    real_uri: string;
    resource_path: string;
}

const resourceTypes: {[T in keyof NamespaceResources]: (string[] |
    [string, T]) } = { // [string, T] improves autocomplete.
        advancements: [".json", "advancements"],
        block_tags: [".json", "tags", "blocks"],
        function_tags: [".json", "tags", "functions"],
        functions: [".mcfunction", "functions"],
        item_tags: [".json", "tags", "items"],
        loot_tables: [".json", "loot_tables"],
        recipes: [".json", "recipes"],
        structures: [".nbt", "structures"],
    };

export async function getNamespaceResources(namespace: string, location: string):
    Promise<NamespaceResources> {
    const result: NamespaceResources = {};
    const namespaceFolder = path.join(location, namespace);
    const subDirs = await subDirectories(namespaceFolder);
    for (const type of keys(resourceTypes)) {
        const resourceInfo = resourceTypes[type];
        if (subDirs.indexOf(resourceInfo[1]) === -1) {
            continue;
        }
        const dataContents = path.join(namespaceFolder, ...resourceInfo.slice(1));
        if (resourceInfo.length > 2 && !(await existsAsync(dataContents))) {
            continue;
        }
        const files = await walkDir(dataContents);
        const nameSpaceContents = result[type] || [];
        for (const file of files) {
            const realExtension = path.extname(file);
            if (realExtension === resourceInfo[0]) {
                const internalUri = path.relative(dataContents, file);
                nameSpaceContents.push({
                    real_uri: path.relative(namespaceFolder, file),
                    resource_path: namespace + ":" +
                        internalUri
                            .slice(0, -realExtension.length).replace(new RegExp(`\\${path.sep}`, "g"), "/"),
                });
            } else {
                mcLangLog(`File '${file}' has the wrong extension: Expected ${resourceInfo[0]}, got ${realExtension}.`);
                continue;
            }
        }
        result[type] = nameSpaceContents;
    }
    return result;
}

export async function getDatapacksResources(dataLocation: string): Promise<Resources> {
    const datapacks: Resources["datapacks"] = [];
    const data: Resources["data"] = {};
    const datapackNames = await subDirectories(dataLocation);
    const promises: Array<Promise<Resources["data"]>> = datapackNames.map(async (packName) => {
        const dataFolder = path.join(dataLocation, packName, "data");
        const datapackNamespaces = await subDirectories(dataFolder);
        datapacks.push({
            name: packName,
            namespaces: datapackNamespaces,
            packs_folder: dataLocation,
        });
        const result: Resources["data"] = {};
        await Promise.all(datapackNamespaces.map(async (namespace) => {
            result[namespace] = await getNamespaceResources(namespace, dataFolder);
        }));
        return result;
    });
    const results = await Promise.all(promises);
    results.forEach((result) => {
        for (const namespace of keys(result)) {
            const namespaceContent = result[namespace];
            for (const dataType of keys(namespaceContent)) {
                data[namespace] = data[namespace] || {};
                const dataDate = data[namespace][dataType] || [];
                // @ts-ignore
                dataDate.push(...namespaceContent[dataType]);
                data[namespace][dataType] = dataDate;
            }
        }
    });
    return {
        data,
        datapacks,
    };
}

async function walkDir(currentPath: string): Promise<string[]> {
    const subFolders: string[] = [];
    try {
        subFolders.push(...(await readDirAsync(currentPath)));
    } catch (error) {
        return [];
    }
    const promises = subFolders.map(async (sub) => {
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
    const promises = files.map<Promise<boolean>>(async (name) => {
        try {
            return (await statAsync(path.join(baseFolder, name))).isDirectory();
        } catch (error) {
            return false;
        }
    });
    const results = await Promise.all(promises);
    return files.filter((_, i) => results[i]);
}
//#region Promisifed Functions
const readDirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const existsAsync = promisify(fs.exists);
//#endregion
