import { StringReader } from "../../brigadier_components/string_reader";
import { ReturnHelper } from "../../misc_functions";
import { Parser } from "../../types";

const parser: Parser = {
    parse: (reader: StringReader) => {
        reader.cursor = reader.getTotalLength();
        return new ReturnHelper().succeed();
    }
};

export = parser;
