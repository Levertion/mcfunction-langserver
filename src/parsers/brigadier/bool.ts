import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { prepareForParser } from "../../misc-functions";
import { Parser } from "../../types";

export const boolParser: Parser = {
    kind: CompletionItemKind.Keyword,
    parse: (reader, props) => prepareForParser(reader.readBoolean(), props)
};
