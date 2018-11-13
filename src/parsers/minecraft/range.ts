import { READER_EXCEPTIONS, StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ReturnedInfo } from "../../types";

export interface MCRange {
    max?: number;
    min?: number;
}

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

export const rangeParser = (float: boolean = false) => (
    reader: StringReader
): ReturnedInfo<MCRange> => {
    const helper = new ReturnHelper();
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
        } else if (/\d\./.test(reader.peek())) {
            const max = float
                ? readFloatLimited(reader)
                : readIntLimited(reader);
            if (!helper.merge(max)) {
                return helper.fail();
            }
            if (max.data < min.data) {
                helper.addErrors();
                return helper.succeed({
                    max: min.data,
                    min: max.data
                });
            }
            if (max.data === min.data) {
                helper.addErrors();
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
};

export const floatRange: Parser = {
    parse: reader => {
        const helper = new ReturnHelper();
        const res = rangeParser(true)(reader);
        return helper.merge(res) ? helper.succeed() : helper.fail();
    }
};

export const intRange: Parser = {
    parse: reader => {
        const helper = new ReturnHelper();
        const res = rangeParser(false)(reader);
        return helper.merge(res) ? helper.succeed() : helper.fail();
    }
};
