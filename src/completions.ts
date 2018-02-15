import { CompletionItem, CompletionItemKind, CompletionList } from "vscode-languageserver/lib/main";
import { DataManager } from "./data/manager";
import { CommandNodePath, CommandTree } from "./data/types";
import { getNextNode } from "./parse";
import { buildInfoForParsers, getNodeAlongPath } from "./parse/node_management";
import { getParser } from "./parse/parsers/get_parser";
import { CommandLine, CommmandData, ParseNode, SuggestResult } from "./types";

export function ComputeCompletions(linenum: number,
    line: CommandLine, character: number, data: DataManager): CompletionList {
    if (line.text.startsWith("#") || !line.parseInfo) {
        return CompletionList.create([], true);
    }
    const commandData: CommmandData = { globalData: data.globalData, localData: data.packData };
    const nodes: ParseNode[] = line.parseInfo ? line.parseInfo.nodes : [];
    const finals: ParseNode[] = [];
    const internals: ParseNode[] = [];
    for (const node of nodes) {
        if (node.high < character) {
            if (node.final === true) {
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
        completions.push(...getCompletionsFromNode(linenum,
            finalNode.high + 1, character, line.text, finalNode.path, commandData));
    }
    for (const insideNode of internals) {
        const newPath = insideNode.path.slice();
        const nodepath = newPath.slice(0, newPath.length - 2);
        completions.push(...getCompletionsFromNode(linenum,
            insideNode.low, character, line.text, nodepath, commandData));
    }
    return CompletionList.create(completions, true);
}

function getCompletionsFromNode(line: number, start: number, end: number,
    text: string, nodepath: CommandNodePath, data: CommmandData): CompletionItem[] {
    const parent = getNextNode(getNodeAlongPath(data.globalData.commands as any as CommandTree,
        nodepath), nodepath, data.globalData.commands as any as CommandTree).node;
    const result: CompletionItem[] = [];
    if (!!parent.children) {
        for (const childKey in parent.children) {
            if (parent.children.hasOwnProperty(childKey)) {
                const child = parent.children[childKey];
                const info = buildInfoForParsers(child, data, nodepath[nodepath.length - 1]);
                const parser = getParser(child);
                if (!!parser) {
                    result.push(...SuggestionsToCompletions(
                        parser.getSuggestions(text.substring(start, end), info),
                        line, start, end, parser.kind));
                }
            }
        }
    }
    return result;
}

function SuggestionsToCompletions(suggestions: SuggestResult[], line: number, start: number, end: number,
    defaultKind: CompletionItemKind = CompletionItemKind.Keyword): CompletionItem[] {
    const result: CompletionItem[] = [];
    for (const suggestion of suggestions) {
        if (typeof suggestion === "string") {
            result.push({
                kind: defaultKind,
                label: suggestion,
                textEdit: {
                    newText: suggestion,
                    range: { start: { character: start, line }, end: { character: end, line } },
                },
            });
        } else {
            result.push({
                detail: suggestion.description,
                kind: suggestion.kind || defaultKind,
                label: suggestion.value,
                textEdit: {
                    newText: suggestion.value,
                    range: { start: { character: start + suggestion.start, line }, end: { character: end, line } },
                },
            });
        }
    }
    return result;
}
