import { Parser } from "../../../types";
import { parseBlockArgument } from "./shared";

const parser: Parser = {
    parse: (reader, info) => parseBlockArgument(reader, info, true)
};

export = parser;
