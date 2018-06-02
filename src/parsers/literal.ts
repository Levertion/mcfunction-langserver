import { CompletionItemKind } from "vscode-languageserver";
import { ReturnHelper } from "../misc_functions";
import { Parser } from "../types";

const parser: Parser = {
    kind: CompletionItemKind.Method,
    parse: (reader, properties) => {
        const helper = new ReturnHelper(properties);
        const begin = reader.cursor;
        const literal = properties.path[properties.path.length - 1];
        if (
            properties.suggesting &&
            literal.startsWith(reader.getRemaining())
        ) {
            helper.addSuggestions(literal);
        }
        if (reader.canRead(literal.length)) {
            const end = begin + literal.length;
            if (reader.string.substring(begin, end) === literal) {
                reader.cursor = end;
                if (reader.peek() === " " || !reader.canRead()) {
                    return helper.succeed();
                }
            }
        }
        return helper.fail();
    }
};

export = parser;
