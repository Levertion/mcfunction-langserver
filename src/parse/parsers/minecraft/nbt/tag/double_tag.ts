import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { parseFloatNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const DOUBLE_TAG_SUFFIX = "d";

export class NBTTagDouble extends NBTTag<number> {

    public tagType: "double" = "double";

    public getActions() {
        return [];
    }

    public _parse(reader: StringReader): void {
        try {
            this.val = parseFloatNBT(reader);
            reader.expect(DOUBLE_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
