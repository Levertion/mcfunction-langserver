import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { parseIntNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const LONG_TAG_SUFFIX = "l";

export class NBTTagLong extends NBTTag<number> {

    public tagType: "long" = "long";

    public getActions() {
        return [];
    }

    public _parse(reader: StringReader): void {
        try {
            this.val = parseIntNBT(reader);
            reader.expect(LONG_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
