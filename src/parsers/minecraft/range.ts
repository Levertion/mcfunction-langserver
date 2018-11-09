import { StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ReturnedInfo } from "../../types";

export interface MCRange {
    max?: number;
    min?: number;
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
        reader.cursor += 2;
        const max = float ? reader.readFloat() : reader.readInt();
        if (!helper.merge(max)) {
            return helper.fail();
        }
        return helper.succeed({
            max: max.data
        });
    } else {
        const min = float ? reader.readFloat() : reader.readInt();
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
            const max = float ? reader.readFloat() : reader.readInt();
            if (helper.merge(max)) {
                return helper.fail();
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
