import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { NBTTag } from "./nbt_tag";

export const LONG_TAG_SUFFIX = "l";

export class NBTTagLong extends NBTTag {

    protected tagType: "long" = "long";

    private val: number = 0;

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader): void {
        try {
            this.val = reader.readInt();
            reader.expect(LONG_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
