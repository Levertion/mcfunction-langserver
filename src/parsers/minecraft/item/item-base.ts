import { CommandErrorBuilder } from "../../../brigadier/errors";
import { StringReader } from "../../../brigadier/string-reader";
import {
    buildTagActions,
    namespaceSuggestionString,
    parseNamespaceOrTag,
    ReturnHelper,
    stringifyNamespace
} from "../../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../../types";

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
            if (parsed.data.resolved && parsed.data.values) {
                helper.merge(
                    buildTagActions(
                        parsed.data.values,
                        start + 1,
                        reader.cursor,
                        properties.data.localData
                    )
                );
            } else {
                if (properties.suggesting && !reader.canRead()) {
                    helper.addSuggestions(
                        ...namespaceSuggestionString(
                            properties.data.globalData.items,
                            parsed.data.parsed,
                            start
                        )
                    );
                }
                const name = stringifyNamespace(parsed.data.parsed);
                if (!properties.data.globalData.items.find(v => v === name)) {
                    helper.addErrors(
                        UNKNOWNITEM.create(start, reader.cursor, name)
                    );
                }
            }
        } else {
            if (parsed.data) {
                helper.addErrors(
                    UNKNOWNTAG.create(
                        start,
                        reader.cursor,
                        stringifyNamespace(parsed.data)
                    )
                );
            } else {
                return helper.fail();
            }
        }
        // Put NBT here
        return helper.succeed();
    }
}
