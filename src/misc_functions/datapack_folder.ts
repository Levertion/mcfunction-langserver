import * as defaultPath from "path";
import { DATAFOLDER, SLASH } from "../consts";
import { NamespacedName, Resources } from "../data/types";
import { typed_keys } from "./third_party/typed_keys";

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

interface ResourceInfo<U = string> {
    extension: string;
    path: [U] | string[]; // Custom tuple improves autocomplete mostly.
    readJson?: boolean;
}

export const resourceTypes: { [T in keyof Resources]-?: ResourceInfo<T> } = {
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

interface KindNamespace {
    kind: keyof Resources;
    location: NamespacedName;
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
                            .replace(path.sep, SLASH);
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
