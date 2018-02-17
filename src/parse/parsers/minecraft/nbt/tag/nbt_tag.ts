import { StringReader } from "../../../../../brigadier_components/string_reader";
import { CorrectLevel } from "../util/nbt_error";

export abstract class NBTTag {
    protected abstract readonly tagType: "byte" | "short" | "int" | "long" |
        "float" | "double" |
        "byte_array" | "int_array" | "long_array" |
        "string" | "list" | "compound";

    protected correct: CorrectLevel = 0;

    public isCorrect() {
        return this.correct;
    }

    public getTagType() {
        return this.tagType;
    }

    public abstract parse(reader: StringReader): void;
}
