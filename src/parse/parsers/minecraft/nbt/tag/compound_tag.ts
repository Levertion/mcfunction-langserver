import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { parseTag } from "../tag_parser";
import { NBTError } from "../util/nbt_error";
import { parseStringNBT, throwIfFalse, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

const NO_KEY = new CommandErrorBuilder("argument.nbt.compound.nokey", "Expected key");
const NO_VAL = new CommandErrorBuilder("argument.nbt.compound.noval", "Expected value");
const NO_END = new CommandErrorBuilder("argument.nbt.compound.noend", "Expected ',' or '}' at end of value");

export const COMPOUND_OPEN = "{";
export const COMPOUND_CLOSE = "}";
export const KEYVAL_SEP = ":";
export const SEP = ",";

export class NBTTagCompound extends NBTTag<{ [key: string]: NBTTag<any> }> {

    public tagType: "compound" = "compound";

    private keyPos: number[][] = [];

    public getActions() {
        const out: SubAction[] = [];
        for (const pos of this.keyPos) {
            out.push({
                data: this.getStringValue().slice(pos[0], pos[1]),
                high: pos[1],
                low: pos[0],
                type: "hover",
            });
        }
        Object.keys(this.val).forEach(
            (v) => out.push(...this.val[v].getActions()),
        );
        return out;
    }

    public getVal() {
        return this.val;
    }

    public _parse(reader: StringReader) {
        const start = reader.cursor;
        tryWithData(() => reader.expect(COMPOUND_OPEN), {}, 0);
        let next = ",";
        const keys = [];
        while (next !== COMPOUND_CLOSE) {

            reader.skipWhitespace();

            throwIfFalse(
                reader.canRead(),
                NO_KEY.create(reader.cursor, reader.cursor),
                { parsed: this, keys, part: "key", path: [] },
                2,
            );
            const keyS = reader.cursor;
            const key = parseStringNBT(reader);
            keys.push(key);
            this.keyPos.push([keyS, reader.cursor]);

            reader.skipWhitespace();

            tryWithData(
                () => reader.expect(KEYVAL_SEP),
                { completions: [KEYVAL_SEP], keys, parsed: this, part: "key", path: [key] },
                2,
            );

            reader.skipWhitespace();

            throwIfFalse(
                reader.canRead(),
                NO_VAL.create(reader.cursor, reader.cursor),
                { parsed: this, keys, part: "value", path: [key] },
                2,
            );
            let val: NBTTag<any>;

            reader.skipWhitespace();

            try {
                val = parseTag(reader);
            } catch (e) {
                throw new NBTError(e, { parsed: this, keys, part: "value", path: [key, ...e] }, 2);
            }
            this.val[key] = val;

            reader.skipWhitespace();

            next = reader.peek();
            if (next !== SEP && next !== COMPOUND_CLOSE) {
                throw new NBTError(
                    NO_END.create(start, reader.cursor),
                    { parsed: this, keys, part: "value", completions: [SEP, COMPOUND_CLOSE], path: [key] },
                    2,
                );
            }
        }
        this.correct = 2;
    }

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        return Object.keys(this.val).length === Object.keys(tag.getVal()).length &&
            Object.keys(this.val).every(
                (v) => this.val[v].tagEq(((tag as NBTTagCompound).val)[v]),
            );
    }
}
