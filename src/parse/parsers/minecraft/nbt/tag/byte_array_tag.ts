import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { NBTError } from "../util/nbt_error";
import { parseIntNBT, tryWithData } from "../util/nbt_util";
import { BYTE_TAG_SUFFIX } from "./byte_tag";
import { NBTTag } from "./nbt_tag";

export const BYTE_ARRAY_PREFIX = "B";

const EXCEPTIONS = {
    NO_VALUE: new CommandErrorBuilder("argument.nbt.bytearray.value", "Expected value"),
};

export class NBTTagByteArray extends NBTTag<number[]> {

    public tagType: "byte_array" = "byte_array";

    public getActions(): SubAction[] {
        return [{
            data: "byte array",
            high: this.end,
            low: this.start,
            type: "hover",
        }];
    }

    public _parse(reader: StringReader) {
        const start = reader.cursor;
        tryWithData(() => reader.expect("["), {}, 0);
        tryWithData(() => reader.expect(BYTE_ARRAY_PREFIX), {}, 0);
        tryWithData(() => reader.expect(";"), {}, 0);
        if (!reader.canRead()) {
            throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
        }
        let next = reader.peek();
        while (next !== "]") {

            reader.skipWhitespace();

            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }

            reader.skipWhitespace();

            tryWithData(() => this.val.push(parseIntNBT(reader)), {}, 2);
            tryWithData(() => reader.expect(BYTE_TAG_SUFFIX), {}, 2);
            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }

            reader.skipWhitespace();

            next = reader.read();
        }
        this.correct = 2;
    }

    public tagEq(tag: NBTTag<any>) {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        const taga: NBTTagByteArray = tag as NBTTagByteArray;
        return this.val.length === taga.getVal().length && this.val.every(
            (v, i) => v === taga.val[i],
        );
    }
}
