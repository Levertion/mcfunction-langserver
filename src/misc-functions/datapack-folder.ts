import * as defaultPath from "path";
import { DATAFOLDER, SLASH, TAG_START } from "../consts";
import {
    DataResource,
    GlobalData,
    MinecraftResource,
    NamespacedName,
    Resources,
    Tag,
    WorldInfo
} from "../data/types";
import { ReturnSuccess } from "../types";
import { getMatching, getResourcesSplit } from "./group-resources";
import { convertToNamespace } from "./namespace";
import { readJSON } from "./promisified-fs";
import { ReturnHelper } from "./return-helper";
import { typed_keys } from "./third_party/typed-keys";

/** A minimal path module for use in this file */
type PathModule = Pick<
    typeof import("path").posix, // N.B. `.posix` is required.
    "extname" | "sep" | "format" | "isAbsolute" | "join" | "normalize" | "parse"
>;

export interface PackLocationSegments {
    pack: string;
    packsFolder: string;
    rest: string;
}

/**
 * Find the datapacks folder a file is in.
 * @param fileLocation The URI of the file
 * @param path The path module to use (allows for testing).
 */
export function parseDataPath(
    fileLocation: string,
    path: PathModule = defaultPath
): PackLocationSegments | undefined {
    const parsed = path.parse(path.normalize(fileLocation));
    const dirs = parsed.dir.split(path.sep);
    const packsFolderIndex = dirs.indexOf("datapacks");
    if (packsFolderIndex !== -1) {
        const remainder = dirs.slice(packsFolderIndex + 1);
        if (remainder.length >= 1) {
            let packsFolder = path.join(...dirs.slice(0, packsFolderIndex + 1));
            // Ugly hack because path.join ignores a leading empty dir, leading to the result of
            // `/home/datapacks` going to `home/datapacks`
            if (path.sep === "/" && !path.isAbsolute(packsFolder)) {
                packsFolder = path.sep + packsFolder;
            }
            packsFolder = path.format({ dir: packsFolder });
            const rest = path.join(...remainder.slice(1), parsed.base);
            return { packsFolder, pack: remainder[0], rest };
        }
    }
    return undefined;
}

interface ResourceInfo<U extends keyof Resources> {
    extension: string;
    path: [U] | string[]; // Custom tuple improves autocomplete mostly.
    mapFunction?(
        value: NonNullable<Resources[U]> extends Array<infer T> ? T : never,
        packroot: string,
        globalData: GlobalData,
        packsInfo?: WorldInfo
    ): Promise<ReturnSuccess<typeof value>>;
}

export const resourceTypes: { [T in keyof Resources]-?: ResourceInfo<T> } = {
    advancements: { extension: ".json", path: ["advancements"] },
    block_tags: {
        extension: ".json",
        mapFunction: async (v, packroot, globalData, packsInfo) =>
            readTag(
                v,
                packroot,
                "block_tags",
                getResourcesSplit("block_tags", globalData, packsInfo),
                s => globalData.blocks.hasOwnProperty(s)
            ),
        path: ["tags", "blocks"]
    },
    function_tags: {
        extension: ".json",
        mapFunction: async (v, packroot, globalData, packsInfo) => {
            const functions = getResourcesSplit(
                "functions",
                globalData,
                packsInfo
            );
            return readTag(
                v,
                packroot,
                "function_tags",
                getResourcesSplit("function_tags", globalData, packsInfo),
                s => getMatching(functions, convertToNamespace(s)).length > 0
            );
        },
        path: ["tags", "functions"]
    },
    functions: { extension: ".mcfunction", path: ["functions"] },
    item_tags: {
        extension: ".json",
        mapFunction: async (v, packroot, globalData, packsInfo) =>
            readTag(
                v,
                packroot,
                "item_tags",
                getResourcesSplit("item_tags", globalData, packsInfo),
                s => globalData.items.indexOf(s) !== -1
            ),
        path: ["tags", "items"]
    },
    loot_tables: { extension: ".json", path: ["loot_tables"] },
    recipes: { extension: ".json", path: ["recipes"] },
    structures: { extension: ".nbt", path: ["structures"] }
};

interface KindNamespace {
    kind: keyof Resources;
    location: NamespacedName & { namespace: string };
}

export function getKindAndNamespace(
    rest: string,
    path: PathModule = defaultPath
): KindNamespace | undefined {
    const sections = path.normalize(rest).split(path.sep);
    if (sections[0] === DATAFOLDER && sections.length > 2) {
        // Namespace,data,
        const remainder = sections.splice(2);
        for (const kind of typed_keys(resourceTypes)) {
            const typeInfo = resourceTypes[kind];
            if (
                (typeInfo.path as string[]).every((v, i) => remainder[i] === v)
            ) {
                const namespace = sections[1];
                const further = remainder.slice(typeInfo.path.length);
                if (further.length > 0) {
                    const last = further[further.length - 1];
                    if (path.extname(last) === typeInfo.extension) {
                        const pth = path
                            .join(
                                ...further.slice(0, -1),
                                last.slice(0, -typeInfo.extension.length)
                            )
                            .replace(new RegExp(`\\${path.sep}`, "g"), SLASH);
                        return {
                            kind,
                            location: {
                                namespace,
                                path: pth
                            }
                        };
                    }
                }
            }
        }
    }
    return undefined;
}

export function getPath(
    resource: MinecraftResource,
    packroot: string,
    kind: keyof Resources,
    path: PathModule = defaultPath
): string {
    return path.join(
        packroot,
        DATAFOLDER,
        resource.namespace,
        ...resourceTypes[kind].path,
        resource.path
            .replace(new RegExp(`\\${SLASH}`, "g"), path.sep)
            .concat(resourceTypes[kind].extension)
    );
}

export function buildPath(
    resource: MinecraftResource,
    packs: WorldInfo,
    kind: keyof Resources,
    path: PathModule = defaultPath
): string | undefined {
    if (resource.pack) {
        const pack = packs.packs[resource.pack];
        return getPath(
            resource,
            path.join(packs.location, pack.name),
            kind,
            path
        );
    } else {
        return undefined;
    }
}

async function readTag(
    resource: MinecraftResource,
    packRoot: string,
    type: keyof Resources,
    options: MinecraftResource[],
    isKnown: (value: string) => boolean
): Promise<ReturnSuccess<DataResource<Tag> | MinecraftResource>> {
    const helper = new ReturnHelper();
    const filePath = getPath(resource, packRoot, type);
    const tag = await readJSON<Tag>(filePath);
    if (helper.merge(tag)) {
        if (
            helper.addFileErrorIfFalse(
                !!tag.data.values,
                filePath,
                "InvalidTagNoValues",
                `tag does not have a values key: ${JSON.stringify(tag.data)}`
            )
        ) {
            if (
                helper.addFileErrorIfFalse(
                    Array.isArray(tag.data.values),
                    filePath,
                    "InvalidTagValuesNotArray",
                    `tag values is not an array: ${JSON.stringify(
                        tag.data.values
                    )}`
                )
            ) {
                if (
                    helper.addFileErrorIfFalse(
                        // tslint:disable-next-line:strict-type-predicates
                        tag.data.values.every(v => typeof v === "string"),
                        filePath,
                        "InvalidTagValuesNotString",
                        `tag values contains a non string value: ${JSON.stringify(
                            tag.data.values
                        )}`
                    )
                ) {
                    const seen = new Set<string>();
                    const duplicates = new Set<string>();
                    const unknowns = new Set<string>();
                    for (const value of tag.data.values) {
                        if (seen.has(value)) {
                            duplicates.add(value);
                        }
                        seen.add(value);
                        if (value.startsWith(TAG_START)) {
                            const result = getMatching(
                                options,
                                convertToNamespace(value)
                            );
                            if (result.length === 0) {
                                unknowns.add(value);
                            }
                        } else if (!isKnown(value)) {
                            unknowns.add(value);
                        }
                    }
                    helper.addFileErrorIfFalse(
                        duplicates.size === 0,
                        filePath,
                        "InvalidTagValuesDuplicates",
                        `Tag contains duplicate values: "${[...duplicates].join(
                            '", "'
                        )}"`
                    );
                    helper.addFileErrorIfFalse(
                        unknowns.size === 0,
                        filePath,
                        "InvalidTagValuesUnknown",
                        `Tag contains unknown values: "${[...unknowns].join(
                            '", "'
                        )}"`
                    );
                    return helper.succeed({
                        ...resource,
                        data: tag.data
                    });
                }
            }
        }
    }
    return helper.succeed(resource);
}
