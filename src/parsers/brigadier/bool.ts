import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { Parser, ReturnedInfo } from "../../types";

const parser: Parser = {
    kind: CompletionItemKind.Keyword,
    parse: (reader) => {
        const result = reader.readBoolean();
        result.data = undefined;
        return result as ReturnedInfo<undefined>;
    },
};

export = parser;
