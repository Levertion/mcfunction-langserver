import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import {
    ARRAY_END,
    ARRAY_PREFIX_SEP,
    ARRAY_START,
    expectAndScope,
    NBTHighlightAction,
    NBTHoverAction,
    tryWithData,
} from "../util/nbt_util";
import { NBTTagByte } from "./byte_tag";
import { NBTTag } from "./nbt_tag";

export const BYTE_ARRAY_PREFIX = "B";

const EXCEPTIONS = {
    NO_VALUE: new CommandErrorBuilder("argument.nbt.bytearray.value", "Expected value"),
};

export class NBTTagByteArray extends NBTTag<NBTTagByte[]> {

    public tagType: "byte_array" = "byte_array";

    private scopes: NBTHighlightAction[] = [];

    public getHover(): NBTHoverAction[] {
        return [{
            data: "byte array",
            end: this.end,
            start: this.start,
        }];
    }

    public getHighlight(): NBTHighlightAction[] {
        return this.scopes.concat({
            end: this.end,
            scopes: ["byte_array", "array"],
            start: this.start,
        });
    }

    public _parse(reader: StringReader) {
        this.scopes = [];
        const start = reader.cursor;
        this.scopes.push(
            expectAndScope(reader, ARRAY_START, ["array", "start"], {}, 0),
            expectAndScope(reader, BYTE_ARRAY_PREFIX, ["array", "prefix"], {}, 0),
            expectAndScope(reader, ARRAY_PREFIX_SEP, ["array", "prefix", "seperator"], {}, 0),
        );
        if (!reader.canRead()) {
            throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
        }
        let next = reader.peek();
        while (next !== ARRAY_END) {

            reader.skipWhitespace();

            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }

            reader.skipWhitespace();

            const val = new NBTTagByte(0);
            val.parse(reader);

            tryWithData(() => this.val.push(val), {}, 2);

            this.scopes.push(...val.getHighlight());

            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }

            reader.skipWhitespace();

            next = reader.read();
        }
        this.scopes.push({
            end: reader.cursor,
            scopes: ["array", "end"],
            start: reader.cursor - 1,
        });
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
