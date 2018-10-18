import { QUOTE, StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export class NBTTagString extends NBTTag {
    public tagType: "string" = "string";
    public value: string | undefined;

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const quoted = reader.peek() === QUOTE;
        const str = reader.readString();
        this.value = str.data;
        if (helper.merge(str)) {
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
