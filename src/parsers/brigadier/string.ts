import { ReturnHelper } from "../../misc_functions";
import { Parser } from "../../types";

const parser: Parser = {
    parse: (reader, properties) => {
        const helper = new ReturnHelper();
        switch (properties.node_properties.type) {
            case "greedy":
                reader.cursor = reader.string.length;
                return helper.succeed();
            case "word":
                reader.readUnquotedString();
                return helper.succeed();
            default:
                if (helper.merge(reader.readString())) {
                    return helper.succeed();
                } else {
                    return helper.fail();
                }
        }
    },
};

export = parser;
