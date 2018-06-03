import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { ReturnHelper } from "../../misc_functions";
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

const parser: Parser = {
  parse: (reader, properties) => {
    const helper = new ReturnHelper();
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
      return helper.fail(
        FLOATEXCEPTIONS.TOOBIG.create(start, reader.cursor, max, result.data)
      );
    }
    if (result.data < min) {
      return helper.fail(
        FLOATEXCEPTIONS.TOOSMALL.create(start, reader.cursor, min, result.data)
      );
    }
    return helper.succeed();
  }
};

export = parser;
