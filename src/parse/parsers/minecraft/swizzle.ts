import { power } from "js-combinatorics";
import { CommandErrorBuilder } from "../../../brigadier_components/errors";
import { StringReader } from "../../../brigadier_components/string_reader";
import { Parser, Suggestion } from "../../../types";

const values = ["x", "y", "z"];

const INVALID_CHAR = new CommandErrorBuilder("argument.swizzle.invalid", "Invalid character '%s'");
const DUPLICATE = new CommandErrorBuilder("argument.swizzle.duplicate", "Duplicate character '%s'");

export class SwizzleParser implements Parser {
    public parse(reader: StringReader) {
        const start = reader.cursor;
        const arr = reader.readUnquotedString().split("");
        for (const s of arr) {
            if (values.indexOf(s) === -1) {
                throw INVALID_CHAR.create(start, reader.cursor, s);
            }
        }
        for (const v of values) {
            if (arr.indexOf(v) !== arr.lastIndexOf(v)) {
                throw DUPLICATE.create(start, reader.cursor, v);
            }
        }
    }

    public getSuggestions(text: string): Suggestion[] {
        const arr = power(values.filter((v) => text.indexOf(v) === -1))
            .map((v) => text + v.join("")).filter((v) => v !== "");
        return arr.map((v) => ({
            start: 0,
            value: v,
        } as Suggestion));
    }
}
