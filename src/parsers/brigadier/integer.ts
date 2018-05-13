import { isNumber } from "util";
import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { ReturnHelper } from "../../misc_functions";
import { Parser } from "../../types";

const JAVAMAXINT = 2147483647;
const JAVAMININT = -2147483648;

const INTEGEREXCEPTIONS = {
    TOOBIG: new CommandErrorBuilder("argument.integer.big", "Integer must not be more than %s, found %s"),
    TOOSMALL: new CommandErrorBuilder("argument.integer.low", "Integer must not be less than %s, found %s"),
};

const parser: Parser = {
    parse: (reader, properties) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const result = reader.readInt();
        if (!helper.merge(result)) {
            return helper.fail();
        }
        const maxVal = properties.node_properties.max;
        const minVal = properties.node_properties.min;
        // See https://stackoverflow.com/a/12957445
        const max = Math.min(isNumber(maxVal) ? maxVal : JAVAMAXINT, JAVAMAXINT);
        const min = Math.max(isNumber(minVal) ? minVal : JAVAMININT, JAVAMININT);
        if (result.data > max) {
            return helper.fail(INTEGEREXCEPTIONS.TOOBIG.create(start, reader.cursor, max, result.data));
        }
        if (result.data < min) {
            return helper.fail(INTEGEREXCEPTIONS.TOOSMALL.create(start, reader.cursor, min, result.data));
        }
        return helper.succeed();
    },
};

export = parser;
