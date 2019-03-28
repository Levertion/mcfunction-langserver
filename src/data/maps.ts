import { convertToID, stringifyID } from "../misc-functions";
import { IDMap, IdSet } from "../misc-functions/id-map";
import { Blocks, PackMap, ResourcesMap, Tag, TagMap } from "../types";

export function createBlockMap(): Blocks {
    const blocks: Blocks = new IDMap();
    blocks.suggestionDescriptionFunction = (v, id) =>
        `Block ${stringifyID(id)} with properties:
${[...v].map(
    ([prop, options]) => ` - ${prop}:
${[...options].map(
    o => `  - ${o};
`
)}`
)}}`;
    return blocks;
}

const resolveTags: TagMap["resolver"] = (
    options: PackMap<Tag | undefined>,
    map: TagMap
) => {
    const finals = new IDMap<undefined>();
    const tags = new IDMap<undefined>();
    const resolved = new IDMap<undefined>();
    for (const [, tag] of options) {
        if (tag) {
            for (const value of tag.values) {
                if (value.startsWith("#")) {
                    const tagId = convertToID(value.substring(1));
                    tags.add(tagId);
                    const newTags = map.get(tagId);
                    if (newTags) {
                        resolved.addFrom(newTags.resolved.resolved);
                    }
                } else {
                    const finalId = convertToID(value);
                    finals.add(finalId);
                    resolved.add(finalId);
                }
            }
        }
    }
    return {
        finals,
        resolved,
        tags
    };
};

function resourceDescriber(
    type: string,
    prefix: string = ""
): ResourcesMap<any, any>["suggestionDescriptionFunction"] {
    return (value, id, _, context) => `${type} ${prefix}${stringifyID(
        id
    )} defined in:
${[...value.keys()]
    .map(packID => {
        if (packID === undefined) {
            return "Vanilla";
        } else {
            const pack =
                context.localData && context.localData.packs.get(packID);
            if (pack) {
                return pack.name;
            }
            return "Unknown";
        }
    })
    .map(s => `- ${s}\n`)}
`;
}

export function createTagMap(type: string): TagMap {
    const tagMap: TagMap = new IDMap(resolveTags);
    tagMap.suggestionDescriptionFunction = resourceDescriber(type, "#");
    return tagMap;
}

export function createResourceMap(type: string): ResourcesMap<any> {
    const result: ResourcesMap<any> = new IDMap();
    result.suggestionDescriptionFunction = resourceDescriber(type);
    return result;
}

export function createRegistryMap(): IdSet {
    // Could add more information
    return new IDMap();
}
