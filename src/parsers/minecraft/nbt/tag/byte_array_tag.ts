import { CommandErrorBuilder } from "../../../../brigadier_components/errors";
import { StringReader } from "../../../../brigadier_components/string_reader";
import {
    actionFromScope,
    actionFromScopes,
    ReturnHelper
} from "../../../../misc_functions";
import {
    ARRAY_END,
    ARRAY_PREFIX_SEP,
    ARRAY_START,
    ARRAY_VALUE_SEP,
    CorrectLevel,
    scopeChar
} from "../util/nbt_util";
import { NBTTagByte } from "./byte_tag";
import { NBTTag, ParseReturn } from "./nbt_tag";

export const BYTE_ARRAY_PREFIX = "B";

const EXCEPTIONS = {
    BAD_CHAR: new CommandErrorBuilder(
        "argument.nbt.bytearray.badchar",
        "Expected ',' or ']', got '%s'"
    ),
    NO_VALUE: new CommandErrorBuilder(
        "argument.nbt.bytearray.value",
        "Expected value"
    )
};

export class NBTTagByteArray extends NBTTag<NBTTagByte[]> {
    public tagType: "byte_array" = "byte_array";

    public parse(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const arrstart = reader.expect(
            ARRAY_START + BYTE_ARRAY_PREFIX + ARRAY_PREFIX_SEP
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
            const val = new NBTTagByte(0);
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
                scopes: ["byte_array"],
                start
            })
        );
        if (helper.hasErrors()) {
            return helper.failWithData({
                correct: CorrectLevel.YES,
                parsed: this
            });
        }
        return helper.succeed(CorrectLevel.YES);
    }

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        const taga: NBTTagByteArray = tag as NBTTagByteArray;
        return (
            this.val.length === taga.getVal().length &&
            this.val.every((v, i) => v.getVal() === taga.val[i].getVal())
        );
    }
}