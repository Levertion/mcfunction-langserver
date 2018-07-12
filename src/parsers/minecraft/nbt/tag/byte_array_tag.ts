import { CommandErrorBuilder } from "../../../../brigadier_components/errors";
import { StringReader } from "../../../../brigadier_components/string_reader";
import { ReturnHelper } from "../../../../misc_functions";
import {
    ARRAY_END,
    ARRAY_PREFIX_SEP,
    ARRAY_START,
    ARRAY_VALUE_SEP,
    CorrectLevel
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

            const val = new NBTTagByte(0);
            const parseResult = val.parse(reader);

            helper.merge(parseResult);

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
