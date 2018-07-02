import {
    CompletionItem,
    CompletionItemKind,
    CompletionList
} from "vscode-languageserver";

import { StringReader } from "./brigadier_components/string_reader";
import { COMMENT_START } from "./consts";
import { DataManager } from "./data/manager";
import { CommandNodePath, CommandTree } from "./data/types";
import { createParserInfo } from "./misc_functions/creators";
import { followPath, getNextNode } from "./misc_functions/node_tree";
import { getParser } from "./parsers/get_parser";
import {
    CommandContext,
    CommmandData,
    FunctionInfo,
    ParseNode,
    SuggestResult
} from "./types";

export function computeCompletions(
    linenum: number,
    character: number,
    document: FunctionInfo,
    data: DataManager
): CompletionList {
    const line = document.lines[linenum];
    if (line.parseInfo === undefined || line.text.startsWith(COMMENT_START)) {
        return CompletionList.create([], true);
    }
    const commandData: CommmandData = {
        globalData: data.globalData,
        localData: data.getPackFolderData(document.pack_segments)
    };
    const nodes = line.parseInfo ? line.parseInfo.nodes : [];
    if (nodes.length === 0) {
        return CompletionList.create(
            getCompletionsFromNode(
                linenum,
                0,
                character,
                line.text,
                [],
                commandData,
                {}
            ),
            true
        );
    }
    const finals: ParseNode[] = [];
    const internals: ParseNode[] = [];
    for (const node of nodes) {
        if (node.high < character) {
            if (node.final) {
                finals.push(node);
            }
        } else {
            if (node.low <= character) {
                internals.push(node);
            }
        }
    }
    const completions: CompletionItem[] = [];
    for (const finalNode of finals) {
        completions.push(
            ...getCompletionsFromNode(
                linenum,
                finalNode.high + 1,
                character,
                line.text,
                finalNode.path,
                commandData,
                finalNode.context
            )
        );
    }
    for (const insideNode of internals) {
        const newPath = insideNode.path.slice();
        const parentPath = newPath.slice(0, -1);
        completions.push(
            ...getCompletionsFromNode(
                linenum,
                insideNode.low,
                character,
                line.text,
                parentPath,
                commandData,
                insideNode.context
            )
        );
    }
    return CompletionList.create(completions, true);
}

function getCompletionsFromNode(
    line: number,
    start: number,
    end: number,
    text: string,
    nodepath: CommandNodePath,
    data: CommmandData,
    context: CommandContext
): CompletionItem[] {
    const parent = getNextNode(
        followPath(data.globalData.commands, nodepath),
        nodepath,
        (data.globalData.commands as any) as CommandTree
    ).node;
    const result: CompletionItem[] = [];
    if (!!parent.children) {
        for (const childKey in parent.children) {
            if (parent.children.hasOwnProperty(childKey)) {
                const child = parent.children[childKey];
                const childPath = [...nodepath, childKey];
                const info = createParserInfo(
                    child,
                    data,
                    childPath,
                    context,
                    true
                );
                const parser = getParser(child);
                if (!!parser) {
                    const reader = new StringReader(text.substring(start, end));
                    const parseResult = parser.parse(reader, info);
                    if (!!parseResult) {
                        result.push(
                            ...suggestionsToCompletions(
                                parseResult.suggestions,
                                line,
                                start,
                                end,
                                parser.kind
                            )
                        );
                    }
                }
            }
        }
    }
    return result;
}

function suggestionsToCompletions(
    suggestions: SuggestResult[],
    line: number,
    start: number,
    end: number,
    defaultKind: CompletionItemKind = CompletionItemKind.Keyword
): CompletionItem[] {
    const result: CompletionItem[] = [];
    for (const suggestion of suggestions) {
        if (typeof suggestion === "string") {
            result.push({
                kind: defaultKind,
                label: suggestion,
                textEdit: {
                    newText: suggestion,
                    range: {
                        end: { character: end, line },
                        start: { character: start, line }
                    }
                }
            });
        } else {
            const completion: CompletionItem = {
                kind: suggestion.kind || defaultKind,
                label: suggestion.text,
                textEdit: {
                    newText: suggestion.text,
                    range: {
                        end: { character: end, line },
                        start: { character: start + suggestion.start, line }
                    }
                }
            };
            if (!!suggestion.description) {
                completion.detail = suggestion.description;
            }
            result.push(completion);
        }
    }
    return result;
}
