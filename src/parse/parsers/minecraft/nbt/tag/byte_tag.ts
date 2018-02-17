import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { NBTTag } from "./nbt_tag";

export const BYTE_TAG_SUFFIX = "b";

export class NBTTagByte extends NBTTag {

    public tagType: "byte" = "byte";

    private val: number = 0;

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader): void {
        try {
            this.val = reader.readInt();
            reader.expect(BYTE_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
