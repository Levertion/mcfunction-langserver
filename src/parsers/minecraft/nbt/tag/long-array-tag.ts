import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import {
    ARRAY_END,
    ARRAY_PREFIX_SEP,
    ARRAY_START,
    ARRAY_VALUE_SEP,
    Correctness
} from "../util/nbt-util";
import { NBTTagLong } from "./long-tag";
import { NBTTag, ParseReturn } from "./nbt-tag";

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

export class NBTTagLongArray extends NBTTag {
    public tagType: "long_array" = "long_array";

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        const taga: NBTTagLongArray = tag as NBTTagLongArray;
        return (
            this.value.length === taga.getVal().length &&
            this.value.every((v, i) => v.getVal() === taga.value[i].getVal())
        );
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const arrstart = reader.expect(
            ARRAY_START + LONG_ARRAY_PREFIX + ARRAY_PREFIX_SEP
        );
        if (!helper.merge(arrstart)) {
            return helper.failWithData({ correct: Correctness.NO });
        }
        if (!reader.canRead()) {
            helper.addSuggestion(reader.cursor, ARRAY_END);
            helper.addErrors(EXCEPTIONS.NO_VALUE.create(start, reader.cursor));
            return helper.failWithData({ parsed: this, correct: 2 });
        }
        if (reader.peek() === ARRAY_END) {
            reader.skip();
            return helper.succeed(2);
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

            const val = new NBTTagLong(0);
            const parseResult = val.parse(reader);

            helper.merge(parseResult);

            this.value.push(val);

            if (!reader.canRead()) {
                helper.addErrors(
                    EXCEPTIONS.NO_VALUE.create(start, reader.cursor)
                );
                return helper.failWithData({ parsed: this, correct: 2 });
            }

            reader.skipWhitespace();
            const opt = reader.readOption(
                [ARRAY_END, ARRAY_VALUE_SEP],
                true,
                undefined,
                "option"
            );
            if (!helper.merge(opt)) {
                return helper.failWithData({ parsed: this, correct: 2 });
            } else {
                next = opt.data;
            }
        }
        return helper.succeed(Correctness.CERTAIN);
    }
}
