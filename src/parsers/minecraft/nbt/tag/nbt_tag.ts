import { StringReader } from "../../../../brigadier_components/string_reader";
import { ReturnFailure, ReturnSuccess } from "../../../../types";
import { CorrectLevel, NBTErrorData } from "../util/nbt_util";

export type ParseReturn =
    | ReturnSuccess<CorrectLevel>
    | ReturnFailure<NBTErrorData>;

export abstract class NBTTag<L> {
    public abstract readonly tagType:
        | "byte"
        | "short"
        | "int"
        | "long"
        | "float"
        | "double"
        | "byte_array"
        | "int_array"
        | "long_array"
        | "string"
        | "list"
        | "compound";

    protected val: L;

    public constructor(val: L) {
        this.val = val;
    }

    public getVal(): L {
        return this.val;
    }

    public abstract parse(reader: StringReader): ParseReturn;

    /**
     * Test if two NBT tags are equivalent in value
     * @param tag The NBT tag to test against
     */
    public tagEq(tag: NBTTag<any>): boolean {
        return tag.tagType === this.tagType && tag.getVal() === this.getVal();
    }
}
