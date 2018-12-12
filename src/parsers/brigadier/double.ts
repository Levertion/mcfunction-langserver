import { CommandErrorBuilder } from "../../brigadier/errors";
import { ReturnHelper } from "../../misc-functions";
import { Parser } from "../../types";

// tslint:disable:binary-expression-operand-order
// Approx
const JAVAMINDOUBLE = -1.8 * 10 ** 308;
const JAVAMAXDOUBLE = 1.8 * 10 ** 308;
// tslint:enable:binary-expression-operand-order

const DOUBLEEXCEPTIONS = {
    TOOBIG: new CommandErrorBuilder(
        "argument.double.big",
        "Float must not be more than %s, found %s"
    ),
    TOOSMALL: new CommandErrorBuilder(
        "argument.double.low",
        "Float must not be less than %s, found %s"
    )
};

export const doubleParser: Parser = {
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
            typeof maxVal === "number" ? maxVal : JAVAMAXDOUBLE,
            JAVAMAXDOUBLE
        );
        const min = Math.max(
            typeof minVal === "number" ? minVal : JAVAMINDOUBLE,
            JAVAMINDOUBLE
        );
        if (result.data > max) {
            helper.addErrors(
                DOUBLEEXCEPTIONS.TOOBIG.create(
                    start,
                    reader.cursor,
                    max.toString(),
                    result.data.toString()
                )
            );
        }
        if (result.data < min) {
            helper.addErrors(
                DOUBLEEXCEPTIONS.TOOSMALL.create(
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
