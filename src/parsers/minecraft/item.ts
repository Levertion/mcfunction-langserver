import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import {
    buildTagActions,
    namespaceSuggestionString,
    parseNamespaceOrTag,
    ReturnHelper,
    stringifyID
} from "../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../types";

import { validateParse } from "./nbt/nbt";

const NOTAG = new CommandErrorBuilder(
    "argument.item.tag.disallowed",
    "Tags aren't allowed here, only actual items"
);

const UNKNOWNTAG = new CommandErrorBuilder(
    "arguments.item.tag.unknown",
    "Unknown item tag '%s'"
);

const UNKNOWNITEM = new CommandErrorBuilder(
    "argument.item.id.invalid",
    "Unknown item '%s'"
);

export class ItemParser implements Parser {
    private readonly useTags: boolean;

    public constructor(useTags: boolean) {
        this.useTags = useTags;
    }

    public parse(
        reader: StringReader,
        properties: ParserInfo
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper(properties);
        const start = reader.cursor;
        const parsed = parseNamespaceOrTag(
            reader,
            properties,
            this.useTags ? "item_tags" : NOTAG
        );
        if (helper.merge(parsed)) {
            const items: string[] = [];
            if (parsed.data.resolved && parsed.data.values) {
                helper.merge(
                    buildTagActions(
                        parsed.data.values,
                        start + 1,
                        reader.cursor,
                        "item_tags",
                        properties.data.localData
                    )
                );
                parsed.data.values.forEach(v => {
                    items.push(...(v.data || { values: [] }).values);
                });
            } else {
                if (properties.suggesting && !reader.canRead()) {
                    helper.addSuggestions(
                        ...namespaceSuggestionString(
                            [
                                ...properties.data.globalData.registries[
                                    "minecraft:item"
                                ]
                            ],
                            start
                        )
                    );
                }
                const name = stringifyID(parsed.data.parsed);
                if (
                    !properties.data.globalData.registries[
                        "minecraft:item"
                    ].has(name)
                ) {
                    helper.addErrors(
                        UNKNOWNITEM.create(start, reader.cursor, name)
                    );
                }
                items.push(name);
            }
            if (reader.peek() === "{") {
                const nbt = validateParse(reader, properties, {
                    ids: items,
                    kind: "item"
                });
                helper.merge(nbt);
            } else {
                helper.addSuggestion(reader.cursor, "{");
            }
        } else {
            if (parsed.data) {
                helper.addErrors(
                    UNKNOWNTAG.create(
                        start,
                        reader.cursor,
                        stringifyID(parsed.data)
                    )
                );
                if (reader.peek() === "{") {
                    const nbt = validateParse(reader, properties, {
                        ids: "none",
                        kind: "item"
                    });
                    helper.merge(nbt);
                } else {
                    helper.addSuggestion(reader.cursor, "{");
                }
            } else {
                return helper.fail();
            }
        }
        return helper.succeed();
    }
}

export const stack = new ItemParser(false);
export const predicate = new ItemParser(true);
