import { CompletionItemKind } from "vscode-languageserver/lib/main";

import {
    buildPath,
    convertToID,
    getResourcesofType,
    idsEqual,
    parseNamespace,
    parseNamespaceOption,
    readNamespaceText,
    ReturnHelper
} from "..";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { TAG_START } from "../../consts";
import { DataID, ID, Resources, Tag, WorldInfo } from "../../data/types";
import {
    CE,
    ParserInfo,
    ReturnedInfo,
    ReturnSuccess,
    TagMap
} from "../../types";
import { IDMap, NamespaceMapParseResult } from "../id-map";

export interface TagParseResult {
    parsed: ID;
    resolved?: ID[];
    values?: Array<DataID<Tag>>;
}

/**
 * Parse a namespace or tag.
 * Returned:
 *  - values are the resources which are the exact matches
 *  - resolved are the lowest level tag members
 *  - parsed is the literal tag. If parsed exists, but not resolved/values, then it was a non-tag
 *  - if not successful, if data undefined then parsing failed.
 *  - if data is a value, then a tag parsed but was unknown
 */
export function parseNamespaceOrTag(
    reader: StringReader,
    info: ParserInfo,
    taghandling: TagMap | CommandErrorBuilder
): ReturnedInfo<TagParseResult, CE, ID | undefined> {
    const helper = new ReturnHelper(info);
    const start = reader.cursor;
    if (reader.peek() === TAG_START) {
        reader.skip();
        if (taghandling instanceof IDMap) {
            const result = taghandling.parse(reader, info.data);
            if (helper.merge(result)) {
                const { id, raw, resolved } = result.data;

                return helper.succeed({ parsed: id });
            }
        } else {
            readNamespaceText(reader);
            return helper.fail(taghandling.create(start, reader.cursor));
        }
    } else {
        if (!reader.canRead() && typeof taghandling === "string") {
            helper.addSuggestion(
                reader.cursor,
                TAG_START,
                CompletionItemKind.Operator
            );
        }
        const parsed = parseNamespace(reader);
        if (helper.merge(parsed)) {
            return helper.succeed({ parsed: parsed.data });
        } else {
            return helper.fail();
        }
    }
}

export function buildTagActions(
    tags: Array<DataID<Tag>>,
    low: number,
    high: number,
    type: keyof Resources,
    localData?: WorldInfo
): ReturnSuccess<void> {
    const helper = new ReturnHelper();
    for (const resource of tags) {
        if (resource.data) {
            helper.addActions({
                data: `\`\`\`json
${JSON.stringify(resource.data, undefined, 4)}
\`\`\``,
                high,
                low,
                type: "hover"
            });
        }
        if (localData) {
            const location = buildPath(resource, localData, type);
            if (location) {
                helper.addActions({
                    data: location,
                    high,
                    low,
                    type: "source"
                });
            }
        }
    }
    return helper.succeed();
}
