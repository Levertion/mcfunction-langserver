import { StringReader } from "../../../../../brigadier_components/string_reader";
import { parseStringNBT, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagString extends NBTTag<string> {
    public tagType: "string" = "string";

    public getHover() {
        return [];
    }

    public getHighlight() {
        return [];
    }

    public _parse(reader: StringReader) {
        tryWithData(() => this.val = parseStringNBT(reader), {}, 1);
        this.correct = 1;
    }
}
