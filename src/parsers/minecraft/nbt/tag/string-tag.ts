import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { NBTTag, ParseReturn } from "./nbt-tag";

export class NBTTagString extends NBTTag<string> {
    public tagType: "string" = "string";

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const str = reader.readString();
        if (!helper.merge(str)) {
            return helper.failWithData({ correct: 1 });
        } else {
            this.val = str.data;
            return helper.succeed(1);
        }
    }
}
