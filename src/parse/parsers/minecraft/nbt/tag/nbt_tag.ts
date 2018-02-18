import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { CorrectLevel } from "../util/nbt_error";

export abstract class NBTTag {
    public abstract readonly tagType: "byte" | "short" | "int" | "long" |
        "float" | "double" |
        "byte_array" | "int_array" | "long_array" |
        "string" | "list" | "compound";

    protected correct: CorrectLevel = 0;
    protected start = 0;
    protected end = 0;
    private stringValue = "";

    public abstract getActions(): SubAction[];

    public getStringValue() {
        return this.stringValue;
    }

    public isCorrect() {
        return this.correct;
    }

    public parse(reader: StringReader) {
        const start = reader.cursor;
        this.start = start;
        try {
            this._parse(reader);
        } catch (e) {
            this.end = reader.cursor;
            this.stringValue = reader.string.slice(this.start, this.end);
            throw e;
        }
        this.end = reader.cursor;
        this.stringValue = reader.string.slice(this.start, this.end);
    }

    protected abstract _parse(reader: StringReader): void;
}
