import { isNumber } from "util";
import { CommandErrorBuilder } from "../../../brigadier_components/errors";
import { Parser } from "../../../types";

const JAVAMINFLOAT = -2139095039;
const JAVAMAXFLOAT = 2139095039;

const FLOATEXCEPTIONS = {
    TOOBIG: new CommandErrorBuilder("argument.float.big", "Float must not be more than %s, found %s"),
    TOOSMALL: new CommandErrorBuilder("argument.float.low", "Float must not be less than %s, found %s"),
};

const parser: Parser = {
    getSuggestions: () => {
        return [];
    },
    parse: (reader, properties) => {
        const start = reader.cursor;
        const read = reader.readFloat();
        const maxVal = properties.node_properties.max;
        const minVal = properties.node_properties.min;
        // See https://stackoverflow.com/a/12957445
        const max = Math.min(isNumber(maxVal) ? maxVal : JAVAMAXFLOAT, JAVAMAXFLOAT);
        const min = Math.max(isNumber(minVal) ? minVal : JAVAMINFLOAT, JAVAMINFLOAT);
        if (read > max) {
            throw FLOATEXCEPTIONS.TOOBIG.create(start, reader.cursor, max, read);
        }
        if (read < min) {
            throw FLOATEXCEPTIONS.TOOSMALL.create(start, reader.cursor, min, read);
        }
    },
};

export = parser;
