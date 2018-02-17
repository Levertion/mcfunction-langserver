import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const INT_ARRAY_PREFIX = "I";

const EXCEPTIONS = {
    NO_VALUE: new CommandErrorBuilder("argument.nbt.intarray.value", "Expected value"),
};

export class NBTTagIntArray extends NBTTag {
    public tagType: "int_array" = "int_array";

    private val: number[];

    constructor(val: number[] = []) {
        super();
        this.val = val;
    }

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader) {
        const start = reader.cursor;
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
    }
}
