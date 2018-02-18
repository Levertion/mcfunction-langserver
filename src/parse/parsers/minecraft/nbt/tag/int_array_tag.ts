import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { NBTError } from "../util/nbt_error";
import { tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const INT_ARRAY_PREFIX = "B";

const EXCEPTIONS = {
    NO_VALUE: new CommandErrorBuilder("argument.nbt.intarray.value", "Expected value"),
};

export class NBTTagIntArray extends NBTTag {

    public tagType: "int_array" = "int_array";

    private val: number[];
    private strVal: string = "";
    private start = 0;
    private end = 0;

    constructor(val: number[] = []) {
        super();
        this.val = val;
    }

    public getActions(): SubAction[] {
        return [{
            data: "integer array",
            high: this.end,
            low: this.start,
            type: "hover",
        }];
    }

    public getStringValue() {
        return this.strVal;
    }

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader) {
        const start = reader.cursor;
        this.start = start;
        try {
            tryWithData(() => reader.expect("["), {}, 0);
            tryWithData(() => reader.expect(INT_ARRAY_PREFIX), {}, 0);
            tryWithData(() => reader.expect(";"), {}, 0);
            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }
            let next = reader.peek();
            while (next !== "]") {
                if (!reader.canRead()) {
                    throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
                }
                tryWithData(() => reader.readInt(), {}, 2);
                if (!reader.canRead()) {
                    throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
                }
                next = reader.read();
            }
            this.correct = 2;
            this.strVal = reader.string.slice(start, reader.cursor);
            this.end = reader.cursor;
        } catch (e) {
            this.strVal = reader.string.slice(start, reader.cursor);
            this.end = reader.cursor;
            throw e;
        }
    }
}
