import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { ReturnHelper } from "../misc-functions";
import { Parser } from "../types";

export const literalParser: Parser = {
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
