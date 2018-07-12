import { power } from "js-combinatorics";
import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { StringReader } from "../../brigadier_components/string_reader";
import { ReturnHelper } from "../../misc_functions";
import { Parser } from "../../types";

const values = ["x", "y", "z"];

const INVALID_CHAR = new CommandErrorBuilder(
    "argument.swizzle.invalid",
    "Invalid character '%s'"
);
const DUPLICATE = new CommandErrorBuilder(
    "argument.swizzle.duplicate",
    "Duplicate character '%s'"
);

export const parser: Parser = {
    parse: (reader: StringReader) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const arr = reader.readUnquotedString().split("");
        for (const s of arr) {
            if (values.indexOf(s) === -1) {
                helper.addErrors(INVALID_CHAR.create(start, reader.cursor, s));
            }
        }
        for (const v of values) {
            if (arr.indexOf(v) !== arr.lastIndexOf(v)) {
                helper.addErrors(DUPLICATE.create(start, reader.cursor, v));
            }
        }
        const text = reader.string.substring(start, reader.cursor);
        const suggestions = power(values.filter(v => text.indexOf(v) === -1))
            .map(v => text + v.join(""))
            .filter(v => v !== "");
        suggestions.forEach(v => helper.addSuggestion(0, v));
        if (helper.hasErrors()) {
            return helper.fail();
        } else {
            return helper.succeed();
        }
    }
};
