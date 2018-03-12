import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { parseFloatNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const FLOAT_TAG_SUFFIX = "f";

export class NBTTagFloat extends NBTTag<number> {

    public tagType: "float" = "float";

    public getActions() {
        return [];
    }

    public _parse(reader: StringReader): void {
        try {
            this.val = parseFloatNBT(reader);
            reader.expect(FLOAT_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
