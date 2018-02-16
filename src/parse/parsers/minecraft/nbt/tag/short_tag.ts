import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { NBTTag } from "./nbt_tag";

export const SHORT_TAG_SUFFIX = "s";

export class NBTTagShort extends NBTTag {

    protected tagType: "short" = "short";

    private val: number = 0;

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader): void {
        try {
            this.val = reader.readInt();
            reader.expect(SHORT_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
    }
}
