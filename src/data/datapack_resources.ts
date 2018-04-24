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
        [namespace: string]: NamespaceData,
    };
}

export interface Tag {
    replace?: boolean;
    values: string[];
}

export interface NamespaceData {
    functions?: MinecraftResource[];
    recipes?: MinecraftResource[];
    advancements?: MinecraftResource[];
    loot_tables?: MinecraftResource[];
    structures?: MinecraftResource[];
    block_tags?: MinecraftResource[];
    item_tags?: MinecraftResource[];
    function_tags?: MinecraftResource[];
}

export interface DataResource<T> extends MinecraftResource {
    data?: T;
}

export interface MinecraftResource {
    real_uri: string;
    resource_name: NamespacedName;
}

export interface NamespacedName {
    namespace: string;
    path: string;
}

export interface ExactNamespaceName extends NamespacedName {
    exact: boolean;
}

export function exactifyNamespace(originalName: NamespacedName): ExactNamespaceName {
    return Object.assign(originalName, { exact: true });
}

interface ResourceInfo<U = string> {
    extension: string;
    pathfromroot: [U] | string[]; // Custom tuple allows autocomplete mostly.
    readJson?: boolean;
}

const resourceTypes: {[T in keyof NamespaceData]: ResourceInfo<T>} = {
    advancements: { extension: ".json", pathfromroot: ["advancements"] },
    block_tags: { extension: ".json", pathfromroot: ["tags", "blocks"], readJson: true },
    function_tags: { extension: ".json", pathfromroot: ["tags", "functions"] },
    functions: { extension: ".mcfunction", pathfromroot: ["functions"] },
    item_tags: { extension: ".json", pathfromroot: ["tags", "items"] },
    loot_tables: { extension: ".json", pathfromroot: ["loot_tables"] },
    recipes: { extension: ".json", pathfromroot: ["recipes"] },
    structures: { extension: ".nbt", pathfromroot: ["structures"] },
};

export async function getNamespaceResources(namespace: string, location: string):
    Promise<NamespaceData> {
    const result: NamespaceData = {};
    const namespaceFolder = path.join(location, namespace);
    const subDirs = await subDirectories(namespaceFolder);
    for (const type of keys(resourceTypes)) {
        const resourceInfo = resourceTypes[type];
        if (resourceInfo === undefined) {
            continue;
        }
        if (subDirs.indexOf(resourceInfo.pathfromroot[0]) === -1) {
            continue;
        }
        const dataContents = path.join(namespaceFolder, ...resourceInfo.pathfromroot);
        if (resourceInfo.pathfromroot.length > 1 && !(await existsAsync(dataContents))) {
            continue;
        }
        const files = await walkDir(dataContents);
        const nameSpaceContents = result[type] || [];
        for (const file of files) {
            const realExtension = path.extname(file);
            if (realExtension === resourceInfo.extension) {
                const internalUri = path.relative(dataContents, file);
                const newResource: MinecraftResource = {
                    real_uri: path.relative(namespaceFolder, file),
                    resource_name: {
                        namespace, path: internalUri
                            .slice(0, -realExtension.length).replace(new RegExp(`\\${path.sep}`, "g"), "/"),
                    },
                };
                try {
                    if (!!resourceInfo.readJson) {
                        // @ts-ignore The resources are only officially allowed to be MinecraftResources.
                        // However, they are cast to DataResources at a later time if applicable.
                        newResource.data = JSON.parse(await readFileAsync(file));
                    }
                } catch (error) {
                    mcLangLog(`File '${file}' has invalid json structure: '${JSON.stringify(error)}'`);
                }
                nameSpaceContents.push(newResource);
            } else {
                mcLangLog(`File '${file}' has the wrong extension: Expected ${
                    resourceInfo.extension}, got ${realExtension}.`);
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
const readFileAsync = promisify(fs.readFile);
const statAsync = promisify(fs.stat);
const existsAsync = promisify<string, boolean>((location, cb) =>
    fs.exists(location, (result) => cb(undefined as any, result)));
//#endregion
