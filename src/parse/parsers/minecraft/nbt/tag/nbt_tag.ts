import { StringReader } from "../../../../../brigadier_components/string_reader";

export abstract class NBTTag {
    protected abstract readonly tagType: "byte" | "short" | "int" | "long" |
        "float" | "double" |
        "byte_array" | "int_array" | "long_array" |
        "string" | "list" | "compound";
    public abstract parse(reader: StringReader): void;
}
