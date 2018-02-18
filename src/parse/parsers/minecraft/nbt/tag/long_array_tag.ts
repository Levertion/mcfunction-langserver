import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { NBTError } from "../util/nbt_error";
import { parseIntNBT, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const LONG_ARRAY_PREFIX = "B";

const EXCEPTIONS = {
    NO_VALUE: new CommandErrorBuilder("argument.nbt.longarray.value", "Expected value"),
};

export class NBTTagLongArray extends NBTTag {

    public tagType: "long_array" = "long_array";

    private val: number[];

    constructor(val: number[] = []) {
        super();
        this.val = val;
    }

    public getActions(): SubAction[] {
        return [{
            data: "long array",
            high: this.end,
            low: this.start,
            type: "hover",
        }];
    }

    public getVal() {
        return this.val;
    }

    public _parse(reader: StringReader) {
        const start = reader.cursor;
        tryWithData(() => reader.expect("["), {}, 0);
        tryWithData(() => reader.expect(LONG_ARRAY_PREFIX), {}, 0);
        tryWithData(() => reader.expect(";"), {}, 0);
        if (!reader.canRead()) {
            throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
        }
        let next = reader.peek();
        while (next !== "]") {
            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }
            tryWithData(() => this.val.push(parseIntNBT(reader)), {}, 2);
            if (!reader.canRead()) {
                throw new NBTError(EXCEPTIONS.NO_VALUE.create(start, reader.cursor), { parsed: this }, 2);
            }
            next = reader.read();
        }
        this.correct = 2;
    }
}
