import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import {
    ARRAY_END,
    ARRAY_PREFIX_SEP,
    ARRAY_START,
    ARRAY_VALUE_SEP,
    expectAndScope,
    NBTHighlightAction,
    NBTHoverAction,
} from "../util/nbt_util";
import { NBTTagByte } from "./byte_tag";
import { NBTTag } from "./nbt_tag";

export const BYTE_ARRAY_PREFIX = "B";

const EXCEPTIONS = {
    BAD_CHAR: new CommandErrorBuilder("argument.nbt.bytearray.badchar", "Expected ',' or ']', got '%s'"),
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
            expectAndScope(reader, ARRAY_START, ["array-start"], {}, 0),
            expectAndScope(reader, BYTE_ARRAY_PREFIX, ["prefix"], {}, 0),
            expectAndScope(reader, ARRAY_PREFIX_SEP, [
                "prefix",
                "prefix-values-seperator",
                "seperator",
            ], {}, 0),
        );
        const valsStart = reader.cursor;
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

            const valStart = reader.cursor;
            const val = new NBTTagByte(0);
            val.parse(reader);

            this.scopes.push({
                end: reader.cursor,
                scopes: ["value"],
                start: valStart,
            });

            this.val.push(val);

            this.scopes.push(...val.getHighlight());

            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }

            reader.skipWhitespace();

            next = reader.read();

            if (next !== ARRAY_VALUE_SEP && next !== ARRAY_END) {
                throw new NBTError(EXCEPTIONS.BAD_CHAR.create(start, reader.cursor, next), { parsed: this }, 2);
            }
        }
        this.scopes.push({
            end: reader.cursor - 1,
            scopes: ["values"],
            start: valsStart,
        });
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
