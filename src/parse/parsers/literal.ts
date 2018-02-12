import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { Parser } from "../../types";

const parser: Parser = {
    getSuggestions: (start, properties) => {
        if (properties.key.startsWith(start)) {
            return [properties.key];
        } else {
            return [];
        }
    },
    kind: CompletionItemKind.Method,
    parse: (reader, properties) => {
        const begin = reader.cursor;
        const literal = properties.key;
        if (reader.canRead(literal.length)) {
            const end = begin + literal.length;
            if (reader.string.substring(begin, end) === literal) {
                reader.cursor = end;
                if (reader.peek() === " " || !reader.canRead()) {
                    return { successful: true };
                }
            }
        }
        return { successful: false };
    },
};

export = parser;
