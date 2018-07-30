import { CompletionItemKind } from "vscode-languageserver/lib/main";
import {
    buildPath,
    convertToNamespace,
    getResourcesofType,
    namespacesEqual,
    ReturnHelper
} from "..";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { TAG_START } from "../../consts";
import {
    DataResource,
    NamespacedName,
    PacksInfo,
    Resources,
    Tag
} from "../../data/types";
import { CE, ParserInfo, ReturnedInfo, ReturnSuccess } from "../../types";
import {
    parseNamespace,
    parseNamespaceOption,
    readNamespaceText
} from "./namespace";

export interface TagParseResult {
    parsed: NamespacedName;
    resolved?: NamespacedName[];
    values?: Array<DataResource<Tag>>;
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
    taghandling: keyof Resources | CommandErrorBuilder
): ReturnedInfo<TagParseResult, CE, NamespacedName | undefined> {
    const helper = new ReturnHelper(info);
    const start = reader.cursor;
    if (reader.peek() === TAG_START) {
        reader.skip();
        if (typeof taghandling === "string") {
            const tags: Array<DataResource<Tag>> = getResourcesofType(
                info.data,
                taghandling
            );
            const parsed = parseNamespaceOption(
                reader,
                tags,
                CompletionItemKind.Folder
            );
            if (helper.merge(parsed)) {
                const values = parsed.data.values;
                const resolved: NamespacedName[] = [];
                for (const value of values) {
                    resolved.push(...getLowestForTag(value, tags));
                }
                return helper.succeed<TagParseResult>({
                    parsed: parsed.data.literal,
                    resolved,
                    values
                });
            } else {
                return helper.failWithData(parsed.data);
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

function getLowestForTag(
    tag: DataResource<Tag>,
    options: Array<DataResource<Tag>>
): NamespacedName[] {
    if (!tag.data) {
        return [];
    }
    const results: NamespacedName[] = [];
    for (const tagMember of tag.data.values) {
        if (tagMember[0] === TAG_START) {
            const namespace = convertToNamespace(tagMember.substring(1));
            for (const option of options) {
                if (namespacesEqual(namespace, option)) {
                    results.push(...getLowestForTag(option, options));
                }
            }
        } else {
            results.push(convertToNamespace(tagMember));
        }
    }
    return results;
}

export function buildTagActions(
    tags: Array<DataResource<Tag>>,
    low: number,
    high: number,
    localData?: PacksInfo
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
            const location = buildPath(resource, localData, "block_tags");
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
