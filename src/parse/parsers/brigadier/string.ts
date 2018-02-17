import { Parser } from "../../../types";

const parser: Parser = {
    getSuggestions: () => {
        return [];
    },
    parse: (reader, properties) => {
        switch (properties.node_properties.type) {
            case "greedy":
                reader.cursor = reader.string.length;
                break;
            case "word":
                reader.readUnquotedString();
                break;
            default:
                reader.readString();
                break;
        }
    },
};

export = parser;
