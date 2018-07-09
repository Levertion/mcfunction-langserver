import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { StringReader } from "../../brigadier_components/string_reader";
import { TAG_START } from "../../consts";
import {
    DataResource,
    MinecraftResource,
    NamespacedName,
    Resources,
    Tag
} from "../../data/types";
import { CE, ParserInfo, ReturnedInfo } from "../../types";
import { getResourcesofType } from "../group_resources";
import { convertToNamespace, namespacesEqual } from "../namespace";
import { ReturnHelper } from "../returnhelper";
import {
    parseNamespace,
    parseNamespaceOption,
    readNamespaceText
} from "./namespace";

const EXCEPTIONS = {
    no_tags: new CommandErrorBuilder(
        "argument.tags.notallowed",
        "Block tags are not allowed here"
    )
};

interface TagParseResult {
    parsed: NamespacedName;
    resolved?: NamespacedName[];
    values?: MinecraftResource[];
}

export function parseNamespaceOrTag(
    reader: StringReader,
    info: ParserInfo,
    tagType?: keyof Resources
): ReturnedInfo<TagParseResult, CE, NamespacedName | undefined> {
    const helper = new ReturnHelper(info);
    if (reader.peek() === TAG_START) {
        reader.skip();
        const tagStart = reader.cursor;
        if (tagType) {
            const tags: Array<DataResource<Tag>> = getResourcesofType(
                info.data,
                tagType
            );
            const parsed = parseNamespaceOption(reader, tags);
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
            return helper.fail(
                EXCEPTIONS.no_tags.create(tagStart, reader.cursor)
            );
        }
    } else {
        if (!reader.canRead() && tagType) {
            helper.addSuggestion(reader.cursor, TAG_START);
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
