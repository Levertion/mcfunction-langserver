import { DiagnosticSeverity } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { READER_EXCEPTIONS, StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ReturnedInfo } from "../../types";

export interface MCRange {
    max?: number;
    min?: number;
}

const swapped = new CommandErrorBuilder(
    "argument.range.swapped",
    "Min cannot be bigger than max"
);
const equalEnds = new CommandErrorBuilder(
    "argument.range.equal",
    "Min and max are eqaul and can be replaced by '%s'",
    DiagnosticSeverity.Hint
);

const digregex = /\d/;

function readIntLimited(reader: StringReader): ReturnedInfo<number> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const neg = reader.peek() === "-";
    if (neg) {
        reader.skip();
    }
    const num = reader.readWhileRegexp(digregex);
    if (num.length === 0) {
        if (neg) {
            return helper.fail(
                READER_EXCEPTIONS.INVALID_INT.create(start, reader.cursor)
            );
        } else {
            return helper.fail(
                READER_EXCEPTIONS.EXPECTED_INT.create(start, reader.cursor)
            );
        }
    }
    return helper.succeed(parseInt(`${neg ? "-" : ""}${num}`, 10));
}

function readFloatLimited(reader: StringReader): ReturnedInfo<number> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const neg = reader.peek() === "-";
    if (neg) {
        reader.skip();
    }

    let hasDecPoint = false;

    const num = reader.readWhileFunction(v => {
        if (v === ".") {
            if (hasDecPoint) {
                return false;
            } else {
                hasDecPoint = true;
                return true;
            }
        } else if (/\d/.test(v)) {
            return true;
        }
        return false;
    });
    if (num.length === 0) {
        if (neg) {
            return helper.fail(
                READER_EXCEPTIONS.INVALID_FLOAT.create(start, reader.cursor)
            );
        } else {
            return helper.fail(
                READER_EXCEPTIONS.EXPECTED_FLOAT.create(start, reader.cursor)
            );
        }
    }
    return helper.succeed(parseFloat(`${neg ? "-" : ""}${num}`));
}

export function parseRange(
    reader: StringReader,
    float: boolean = false
): ReturnedInfo<MCRange> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    if (
        helper.merge(reader.expect(".."), {
            errors: false
        })
    ) {
        const max = float ? readFloatLimited(reader) : readIntLimited(reader);
        if (!helper.merge(max)) {
            return helper.fail();
        }
        return helper.succeed({
            max: max.data
        });
    } else {
        const min = float ? readFloatLimited(reader) : readIntLimited(reader);
        if (!helper.merge(min)) {
            return helper.fail();
        }
        if (
            !helper.merge(reader.expect(".."), {
                errors: false
            })
        ) {
            return helper.succeed({
                max: min.data,
                min: min.data
            });
        } else if (StringReader.charAllowedNumber.test(reader.peek())) {
            const max = float
                ? readFloatLimited(reader)
                : readIntLimited(reader);
            if (!helper.merge(max)) {
                return helper.fail();
            }
            if (max.data < min.data) {
                helper.addErrors(swapped.create(start, reader.cursor));
                helper.addActions({
                    data: `${max.data}..${min.data}`,
                    high: reader.cursor,
                    low: start,
                    type: "format"
                });
                return helper.succeed({
                    max: min.data,
                    min: max.data
                });
            }
            if (max.data === min.data) {
                helper.addErrors(
                    equalEnds.create(start, reader.cursor, min.data.toString())
                );
                helper.addActions({
                    data: `${min.data}`,
                    high: reader.cursor,
                    low: start,
                    type: "format"
                });
            }
            return helper.succeed({
                max: max.data,
                min: min.data
            });
        } else {
            return helper.succeed({
                min: min.data
            });
        }
    }
}

export const floatRange: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const res = parseRange(reader, true);
        return helper.merge(res) ? helper.succeed() : helper.fail();
    }
};

export const intRange: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const res = parseRange(reader, false);
        return helper.merge(res) ? helper.succeed() : helper.fail();
    }
};
