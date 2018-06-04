import { CommandErrorBuilder } from "../../../../brigadier_components/errors";
import { StringReader } from "../../../../brigadier_components/string_reader";
import {
    actionFromScope,
    actionFromScopes
} from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import {
    ARRAY_END,
    ARRAY_PREFIX_SEP,
    ARRAY_START,
    ARRAY_VALUE_SEP,
    CorrectLevel,
    scopeChar
} from "../util/nbt_util";
import { NBTTagLong } from "./long_tag";
import { NBTTag } from "./nbt_tag";

export const LONG_ARRAY_PREFIX = "L";

const EXCEPTIONS = {
    BAD_CHAR: new CommandErrorBuilder(
        "argument.nbt.longarray.badchar",
        "Expected ',' or ']', got '%s'"
    ),
    NO_VALUE: new CommandErrorBuilder(
        "argument.nbt.longarray.value",
        "Expected value"
    )
};

export class NBTTagLongArray extends NBTTag<NBTTagLong[]> {
    public tagType: "long_array" = "long_array";

    public parse(reader: StringReader) {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const arrstart = reader.expect(
            ARRAY_START + LONG_ARRAY_PREFIX + ARRAY_PREFIX_SEP
        );
        if (!helper.merge(arrstart)) {
            return helper.failWithData({ correct: CorrectLevel.NO });
        }
        helper.addActions(
            ...actionFromScopes([
                scopeChar(reader.cursor - 2, ["array-start"]),
                scopeChar(reader.cursor - 1, ["prefix"]),
                scopeChar(reader.cursor, [
                    "prefix-values-separator",
                    "separator"
                ])
            ])
        );
        const valsStart = reader.cursor;
        if (!reader.canRead()) {
            helper.addErrors(EXCEPTIONS.NO_VALUE.create(start, reader.cursor));
            return helper.failWithData({ parsed: this, correct: 2 });
        }
        let next = reader.peek();
        while (next !== ARRAY_END) {
            reader.skipWhitespace();

            if (!reader.canRead()) {
                helper.addErrors(
                    EXCEPTIONS.NO_VALUE.create(start, reader.cursor)
                );
                return helper.failWithData({ parsed: this, correct: 2 });
            }

            reader.skipWhitespace();

            const valStart = reader.cursor;
            const val = new NBTTagLong(0);
            const parseResult = val.parse(reader);

            helper.merge(parseResult);

            helper.addActions(
                actionFromScope({
                    end: reader.cursor,
                    scopes: ["value"],
                    start: valStart
                })
            );

            this.val.push(val);

            if (!reader.canRead()) {
                helper.addErrors(
                    EXCEPTIONS.NO_VALUE.create(start, reader.cursor)
                );
                return helper.failWithData({ parsed: this, correct: 2 });
            }

            reader.skipWhitespace();
            const opt = reader.expectOption([ARRAY_END, ARRAY_VALUE_SEP]);
            if (!helper.merge(opt)) {
                return helper.failWithData({ parsed: this, correct: 2 });
            } else {
                next = opt.data;
            }
        }
        helper.addActions(
            actionFromScope({
                end: reader.cursor - 1,
                scopes: ["values"],
                start: valsStart
            }),
            actionFromScope(scopeChar(reader.cursor, ["array", "end"])),
            actionFromScope({
                end: reader.cursor,
                scopes: ["long_array"],
                start
            })
        );
        if (helper.hasErrors()) {
            return helper.failWithData({
                parsed: this,
                correct: CorrectLevel.YES
            });
        }
        return helper.succeed(CorrectLevel.YES);
    }

    public tagEq(tag: NBTTag<any>) {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        const taga: NBTTagLongArray = tag as NBTTagLongArray;
        return (
            this.val.length === taga.getVal().length &&
            this.val.every((v, i) => v.getVal() === taga.val[i].getVal())
        );
    }
}
