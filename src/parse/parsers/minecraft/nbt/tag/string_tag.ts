import { StringReader } from "../../../../../brigadier_components/string_reader";
import { tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagString extends NBTTag {
    public tagType: "string" = "string";

    private val: string;

    constructor(val: string = "") {
        super();
        this.val = val;
    }

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader) {
        tryWithData(() => this.val = reader.readString(), {}, 1);
        this.correct = 1;
    }
}
