import { StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser } from "../../types";

export const messageParser: Parser = {
    parse: (reader: StringReader) => {
        reader.cursor = reader.getTotalLength();
        return new ReturnHelper().succeed();
    }
};
