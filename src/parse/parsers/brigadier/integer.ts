import { CommandErrorBuilder } from "../../../brigadier_components/errors";
import { Parser } from "../../../types";

const JAVAMAXINT = 2147483647;
const JAVAMININT = -2147483648;

const INTEGEREXCEPTIONS = {
    TOOBIG: new CommandErrorBuilder("Integer must not be more than %s, found %s", "argument.integer.big"),
    TOOSMALL: new CommandErrorBuilder("Integer must not be less than %s, found %s", "argument.integer.low"),
};

const parser: Parser = {
    getSuggestions: () => {
        return [];
    },
    parse: (reader, properties) => {
        const start = reader.cursor;
        const read = reader.readInt();
        const maxVal = properties.node_properties.max;
        const minVal = properties.node_properties.min;
        // See https://stackoverflow.com/a/12957445
        const min = Math.max(isNaN(minVal) ? JAVAMININT : minVal, JAVAMININT);
        const max = Math.min(isNaN(maxVal) ? JAVAMAXINT : maxVal, JAVAMAXINT);
        if (read > max) {
            throw INTEGEREXCEPTIONS.TOOBIG.create(start, reader.cursor, max, read);
        }
        if (read < min) {
            throw INTEGEREXCEPTIONS.TOOSMALL.create(start, reader.cursor, min, read);
        }
    },
};
export = parser;
