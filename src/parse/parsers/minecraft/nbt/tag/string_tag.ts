import { StringReader } from "../../../../../brigadier_components/string_reader";
import { tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagString extends NBTTag {
    public tagType: "string" = "string";

    private val: string = "";

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader) {
        tryWithData(() => this.val = reader.readString(), {}, 1);
    }
}
