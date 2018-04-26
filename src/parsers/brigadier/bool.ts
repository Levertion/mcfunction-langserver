import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { Parser } from "../../../types";

const parser: Parser = {
    getSuggestions: (start) => {
        const result: string[] = [];
        if ("true".startsWith(start)) {
            result.push("true");
        }
        if ("false".startsWith(start)) {
            result.push("false");
        }
        return result;
    },
    kind: CompletionItemKind.Keyword,
    parse: (reader) => {
        reader.readBoolean();
    },
};

export = parser;
