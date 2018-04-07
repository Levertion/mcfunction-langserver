import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { Parser } from "../../../types";

/**
 * Used for testing.
 * Do not attempt to use an actual command tree using this.
 */
const parser: Parser = {
    getSuggestions: () => [
        "hello",
        { start: 2, value: "test", kind: CompletionItemKind.Constructor },
    ],
    parse: (reader, node) => {
        let num: number = 3;
        if (node.node_properties.number) {
            num = node.node_properties.number;
        }
        if (reader.canRead(num)) {
            reader.cursor += num;
            return { successful: true };
        } else {
            return { successful: false };
        }
    },
};

export = parser;
