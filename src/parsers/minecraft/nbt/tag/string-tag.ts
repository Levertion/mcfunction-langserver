import { QUOTE, StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness } from "../util/nbt-util";

import { NBTTag, ParseReturn } from "./nbt-tag";

export class NBTTagString extends NBTTag {
    protected tagType: "string" = "string";
    protected value = "";

    public getValue(): string {
        return this.value;
    }

    public setValue(val: string): this {
        this.value = val;
        return this;
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const quoted = reader.peek() === QUOTE;
        const str = reader.readString();
        if (helper.merge(str)) {
            this.value = str.data;
            if (quoted) {
                return helper.succeed(Correctness.CERTAIN);
            }
            if (str.data.length === 0) {
                // E.g. `{`, clearly it is not an unquoted string
                return helper.failWithData(Correctness.NO);
            }
            return helper.succeed(Correctness.MAYBE);
        } else {
            if (quoted) {
                return helper.failWithData(Correctness.CERTAIN);
            }
            return helper.failWithData(Correctness.NO);
        }
    }
}
