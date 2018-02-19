import { StringReader } from "../../../../../brigadier_components/string_reader";
import { parseIntNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const BYTE_TAG_SUFFIX = "b";

export class NBTTagByte extends NBTTag<number> {

    public tagType: "byte" = "byte";

    public getActions() {
        return [];
    }

    public _parse(reader: StringReader): void {
        this.val = parseIntNBT(reader);
        reader.expect(BYTE_TAG_SUFFIX);
        this.correct = 2;
    }
}
