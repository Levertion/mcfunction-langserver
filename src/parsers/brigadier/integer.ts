import { CommandErrorBuilder } from "../../brigadier/errors";
import { JAVAMAXINT, JAVAMININT } from "../../consts";
import { ReturnHelper } from "../../misc-functions";
import { Parser } from "../../types";

const INTEGEREXCEPTIONS = {
    TOOBIG: new CommandErrorBuilder(
        "argument.integer.big",
        "Integer must not be more than %s, found %s"
    ),
    TOOSMALL: new CommandErrorBuilder(
        "argument.integer.low",
        "Integer must not be less than %s, found %s"
    )
};

export const intParser: Parser = {
    parse: (reader, properties) => {
        const helper = new ReturnHelper(properties);
        const start = reader.cursor;
        const result = reader.readInt();
        if (!helper.merge(result)) {
            return helper.fail();
        }
        const maxVal = properties.node_properties.max;
        const minVal = properties.node_properties.min;
        // See https://stackoverflow.com/a/12957445
        const max = Math.min(
            typeof maxVal === "number" ? maxVal : JAVAMAXINT,
            JAVAMAXINT
        );
        const min = Math.max(
            typeof minVal === "number" ? minVal : JAVAMININT,
            JAVAMININT
        );
        if (result.data > max) {
            helper.addErrors(
                INTEGEREXCEPTIONS.TOOBIG.create(
                    start,
                    reader.cursor,
                    max.toString(),
                    result.data.toString()
                )
            );
        }
        if (result.data < min) {
            helper.addErrors(
                INTEGEREXCEPTIONS.TOOSMALL.create(
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
