import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { NBTTag } from "./nbt_tag";

export const BYTE_TAG_SUFFIX = "b";

export class NBTTagByte extends NBTTag {

    public tagType: "byte" = "byte";

    private val: number;

    constructor(val: number = 0) {
        super();
        this.val = val;
    }

    public getActions() {
        return [];
    }

    public getVal() {
        return this.val;
    }

    public _parse(reader: StringReader): void {
        this.val = reader.readInt();
        reader.expect(BYTE_TAG_SUFFIX);
        this.correct = 2;
    }
}
