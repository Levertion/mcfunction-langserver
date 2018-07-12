import { StringReader } from "../../../../brigadier_components/string_reader";
import { ReturnHelper } from "../../../../misc_functions";
import { NBTTag, ParseReturn } from "./nbt_tag";

export class NBTTagString extends NBTTag<string> {
    public tagType: "string" = "string";

    public parse(reader: StringReader): ParseReturn {
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
