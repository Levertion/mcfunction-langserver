import { StringReader } from "../../../../../brigadier_components/string_reader";
import { parseStringNBT, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagString extends NBTTag {
    public tagType: "string" = "string";

    private val: string;

    constructor(val: string = "") {
        super();
        this.val = val;
    }

    public getActions() {
        return [];
    }

    public getVal() {
        return this.val;
    }

    public _parse(reader: StringReader) {
        tryWithData(() => this.val = parseStringNBT(reader), {}, 1);
        this.correct = 1;
    }
}
