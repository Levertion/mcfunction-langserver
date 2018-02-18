import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { parseIntNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const SHORT_TAG_SUFFIX = "s";

export class NBTTagShort extends NBTTag {

    public tagType: "short" = "short";

    private val: number;
    private strVal = "";

    constructor(val: number = 0) {
        super();
        this.val = val;
    }

    public getActions() {
        return [];
    }

    public getStringValue() {
        return this.strVal;
    }

    public getVal() {
        return this.val;
    }

    public _parse(reader: StringReader): void {
        try {
            this.val = parseIntNBT(reader);
            reader.expect(SHORT_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
