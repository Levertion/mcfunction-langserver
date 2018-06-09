import { CommandErrorBuilder } from "../../../../brigadier_components/errors";
import { StringReader } from "../../../../brigadier_components/string_reader";
import {
    actionFromScope,
    actionFromScopes
} from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import { ReturnedInfo } from "../../../../types";
import { parseTag } from "../tag_parser";
import {
    LIST_END,
    LIST_START,
    LIST_VALUE_SEP,
    NBTErrorData,
    scopeChar
} from "../util/nbt_util";
import { NBTTag, ParseReturn } from "./nbt_tag";

const MIXED = new CommandErrorBuilder(
    "argument.nbt.list.mixed",
    "Mixed value types"
);
const NOVAL = new CommandErrorBuilder(
    "argument.nbt.list.noval",
    "Expected ']'"
);

export class NBTTagList extends NBTTag<Array<NBTTag<any>>> {
    public tagType: "list" = "list";

    public parse(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        const helper = new ReturnHelper();
        const listStart = reader.expect(LIST_START);
        if (!helper.merge(listStart)) {
            return helper.failWithData({ correct: 0 });
        }
        helper.addActions(
            actionFromScope(scopeChar(reader.cursor, ["list-start", "start"]))
        );
        if (!reader.canRead()) {
            helper.addSuggestion(reader.cursor, LIST_END);
            helper.addErrors(NOVAL.create(start, reader.cursor));
            return helper.failWithData({ parsed: this, correct: 1 });
        }
        let type: NBTTag<any>["tagType"] | undefined;
        let next = reader.peek();
        while (next !== LIST_END) {
            reader.skipWhitespace();

            let value: NBTTag<any>;

            const tag = parseTag(reader);
            if (helper.merge(tag as ReturnedInfo<NBTTag<any> | NBTErrorData>)) {
                value = tag.data as NBTTag<any>;
            } else {
                return helper.failWithData({
                    correct: 1,
                    parsed: this,
                    path: [
                        this.val.length.toString(),
                        ...((tag.data as NBTErrorData).path || [])
                    ]
                });
            }

            if (type === undefined) {
                type = value.tagType;
            } else if (type !== value.tagType) {
                helper.addErrors(MIXED.create(start, reader.cursor));
                return helper.failWithData({ parsed: this, correct: 1 });
            }

            this.val.push(value);

            reader.skipWhitespace();
            const opt = reader.expectOption([LIST_END, LIST_VALUE_SEP]);
            if (!helper.merge(opt)) {
                return helper.failWithData({ parsed: this, correct: 1 });
            } else {
                helper.addActions(
                    actionFromScope(
                        scopeChar(reader.cursor, [
                            "value-separator",
                            "separator"
                        ])
                    )
                );
                next = opt.data;
            }
        }
        helper.addActions(
            ...actionFromScopes([
                {
                    end: reader.cursor,
                    scopes: ["list"],
                    start
                },
                scopeChar(reader.cursor, ["array", "end"])
            ])
        );
        if (helper.hasErrors()) {
            return helper.failWithData({ parsed: this, correct: 1 });
        } else {
            return helper.succeed(1);
        }
    }

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        return (
            this.val.length === (tag as NBTTagList).val.length &&
            this.val.every((v, i) => v.tagEq((tag as NBTTagList).getVal()[i]))
        );
    }
}
