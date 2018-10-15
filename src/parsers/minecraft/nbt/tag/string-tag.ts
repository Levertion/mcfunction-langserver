import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export class NBTTagString extends NBTTag {
    public tagType: "string" = "string";

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const str = reader.readString();
        if (helper.merge(str)) {
            this.value = str.data;
            return helper.succeed(Correctness.CERTAIN);
        } else {
            return helper.failWithData({ correct: Correctness.NO });
        }
    }
}
