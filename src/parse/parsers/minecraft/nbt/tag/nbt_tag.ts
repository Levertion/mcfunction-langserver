import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { CorrectLevel } from "../util/nbt_error";

export abstract class NBTTag {
    public abstract readonly tagType: "byte" | "short" | "int" | "long" |
        "float" | "double" |
        "byte_array" | "int_array" | "long_array" |
        "string" | "list" | "compound";

    protected correct: CorrectLevel = 0;

    public abstract getActions(): SubAction[];

    public abstract getStringValue(): string;

    public isCorrect() {
        return this.correct;
    }

    public abstract parse(reader: StringReader): void;
}
