import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { NBTTag } from "./nbt_tag";

export const DOUBLE_TAG_SUFFIX = "f";

export class NBTTagDouble extends NBTTag {

    public tagType: "double" = "double";

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

    public parse(reader: StringReader): void {
        const start = reader.cursor;
        try {
            this.val = reader.readFloat();
            reader.expect(DOUBLE_TAG_SUFFIX);
        } catch (e) {
            this.strVal = reader.string.slice(start, reader.cursor);
            throw new NBTError(e);
        }
        this.strVal = reader.string.slice(start, reader.cursor);
        this.correct = 2;
    }
}
