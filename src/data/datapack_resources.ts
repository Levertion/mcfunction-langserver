import fs = require("fs");
import path = require("path");

export interface Resources {
    datapacks: Array<{
        name: string;
        namespaces: string[];
    }>;
    data: {
        [namespace: string]: {
            functions: NamespacedResource[],
            recipes: NamespacedResource[],
            advancements: NamespacedResource[],
            loot_tables: NamespacedResource[],
            structures: NamespacedResource[],
            tags: {
                blocks: NamespacedResource[],
                items: NamespacedResource[],
                functions: NamespacedResource[],
            },
        };
    };
}

interface NamespacedResource {
    real_uri: string;
    resource_path: string;
}

const resourceTypes: { [type: string]: (v: NamespacedResource[], s: Resources["data"], n: string) => void } = {
    "advancements": (v, s, n) => s[n].advancements.push(...v),
    "functions": (v, s, n) => s[n].functions.push(...v),
    "loot_tables": (v, s, n) => s[n].loot_tables.push(...v),
    "recipes": (v, s, n) => s[n].recipes.push(...v),
    "structures": (v, s, n) => s[n].structures.push(...v),
    "tags/blocks": (v, s, n) => s[n].tags.blocks.push(...v),
    "tags/functions": (v, s, n) => s[n].tags.functions.push(...v),
    "tags/items": (v, s, n) => s[n].tags.items.push(...v),
};

export function getDatapackResources(dataLocation: string): Resources {
    const datapacks: Resources["datapacks"] = [];
    const data: Resources["data"] = {};
    const datapackNames = fs.readdirSync(dataLocation);
    for (const s of datapackNames) {
        const datapackNamespaces = fs.readdirSync(path.resolve(dataLocation, s, "data"))
            .filter((v) => fs.statSync(path.resolve(dataLocation, s, "data", v)).isDirectory(),
        );
        datapacks.push({
            name: path.basename(s),
            namespaces: datapackNamespaces,
        });
        for (const namespace of datapackNamespaces) {
            data[namespace] = {
                advancements: data[namespace] === undefined || data[namespace].advancements === undefined ? [] :
                    data[namespace].advancements,
                functions: data[namespace] === undefined || data[namespace].functions === undefined ? [] :
                    data[namespace].functions,
                loot_tables: data[namespace] === undefined || data[namespace].loot_tables === undefined ? [] :
                    data[namespace].loot_tables,
                recipes: data[namespace] === undefined || data[namespace].recipes === undefined ? [] :
                    data[namespace].recipes,
                structures: data[namespace] === undefined || data[namespace].structures === undefined ? [] :
                    data[namespace].structures,
                tags: {
                    blocks: data[namespace] === undefined || data[namespace].tags.blocks === undefined ? [] :
                        data[namespace].tags.blocks,
                    functions: data[namespace] === undefined || data[namespace].tags.functions === undefined ? [] :
                        data[namespace].tags.functions,
                    items: data[namespace] === undefined || data[namespace].tags.items === undefined ? [] :
                        data[namespace].tags.items,
                },
            };
            for (const resType of Object.keys(resourceTypes)) {
                const absLoc = path.resolve(dataLocation, s, "data", namespace, resType);
                if (!fs.existsSync(absLoc)) {
                    continue;
                }
                const files = walkDir(absLoc);
                resourceTypes[resType](
                    files.map<NamespacedResource>((v) => {
                        return {
                            real_uri: path.relative(dataLocation, v),
                            resource_path:
                                namespace +
                                ":" +
                                path.relative(absLoc, v).slice(0, -path.extname(v).length),
                        };
                    }),
                    data,
                    namespace,
                );
            }
        }
    }
    return {
        data,
        datapacks,
    };
}

const walkDir = (currentPath: string): string[] => {
    const files: string[] = [];
    for (const sub of fs.readdirSync(currentPath)) {
        if (fs.statSync(path.resolve(currentPath, sub)).isDirectory()) {
            files.push(...walkDir(sub));
        } else {
            files.push(path.resolve(currentPath, sub));
        }
    }
    return files;
};
