import { CompletionItemKind } from "vscode-languageserver";
import { prepareForParser } from "../../misc_functions";
import { Parser } from "../../types";

const parser: Parser = {
    kind: CompletionItemKind.Keyword,
    parse: (reader, props) => prepareForParser(reader.readBoolean(), props)
};

export = parser;
