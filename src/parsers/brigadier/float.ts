import { CommandErrorBuilder } from "../../brigadier/errors";
import { ReturnHelper } from "../../misc-functions";
import { Parser } from "../../types";

const JAVAMINFLOAT = -2139095039;
const JAVAMAXFLOAT = 2139095039;

const FLOATEXCEPTIONS = {
    TOOBIG: new CommandErrorBuilder(
        "argument.float.big",
        "Float must not be more than %s, found %s"
    ),
    TOOSMALL: new CommandErrorBuilder(
        "argument.float.low",
        "Float must not be less than %s, found %s"
    )
};

export const floatParser: Parser = {
    parse: (reader, properties) => {
        const helper = new ReturnHelper(properties);
        const start = reader.cursor;
        const result = reader.readFloat();
        if (!helper.merge(result)) {
            return helper.fail();
        }
        const maxVal = properties.node_properties.max;
        const minVal = properties.node_properties.min;
        // See https://stackoverflow.com/a/12957445
        const max = Math.min(
            typeof maxVal === "number" ? maxVal : JAVAMAXFLOAT,
            JAVAMAXFLOAT
        );
        const min = Math.max(
            typeof minVal === "number" ? minVal : JAVAMINFLOAT,
            JAVAMINFLOAT
        );
        if (result.data > max) {
            helper.addErrors(
                FLOATEXCEPTIONS.TOOBIG.create(
                    start,
                    reader.cursor,
                    max.toString(),
                    result.data.toString()
                )
            );
        }
        if (result.data < min) {
            helper.addErrors(
                FLOATEXCEPTIONS.TOOSMALL.create(
                    start,
                    reader.cursor,
                    min.toString(),
                    result.data.toString()
                )
            );
        }
        return helper.succeed();
    }
};
