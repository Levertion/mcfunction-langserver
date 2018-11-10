import { DiagnosticSeverity } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { typed_keys } from "../../misc-functions/third_party/typed-keys";
import { Parser } from "../../types";

const EXCEPTIONS = {
    invalid_unit: new CommandErrorBuilder(
        "argument.time.invalid_unit",
        "Invalid unit '%s'"
    ),
    // This is not tested
    not_integer: new CommandErrorBuilder(
        "argument.time.not_nonnegative_integer",
        "Not a non-negative integer number of ticks: %s (Due to differences in the representation of floating point numbers, Minecraft Java Edition might not fail for this value)",
        DiagnosticSeverity.Warning
    ),
    not_nonegative_integer: new CommandErrorBuilder(
        "argument.time.not_nonnegative_integer",
        "Not a non-negative integer number of ticks: %s"
    )
};

export const times = {
    d: 24000,
    s: 20,
    t: 1
};

export const timeParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const start = reader.cursor;
        const float = reader.readFloat();
        if (!helper.merge(float)) {
            return helper.fail();
        }
        const suffixStart = reader.cursor;
        const suffix = reader.readOption(typed_keys(times), {
            quote: false,
            unquoted: StringReader.charAllowedInUnquotedString
        });
        if (!helper.merge(suffix)) {
            if (suffix.data !== "") {
                return helper
                    .addErrors(
                        EXCEPTIONS.invalid_unit.create(
                            suffixStart,
                            reader.cursor,
                            suffix.data || "none"
                        )
                    )
                    .succeed();
            }
        }
        const unit = times[suffix.data as keyof typeof times] || 1;
        const result = unit * float.data;
        if (result < 0) {
            return helper
                .addErrors(
                    EXCEPTIONS.not_nonegative_integer.create(
                        start,
                        reader.cursor,
                        result.toString()
                    )
                )
                .succeed();
        }
        if (!Number.isInteger(result)) {
            return helper
                .addErrors(
                    EXCEPTIONS.not_integer.create(
                        start,
                        reader.cursor,
                        result.toString()
                    )
                )
                .succeed();
        }
        return helper.succeed();
    }
};
