import { EventEmitter } from "events";
import { DiagnosticSeverity } from "vscode-languageserver";

import { CommandErrorBuilder } from "./brigadier_components/errors";
import { StringReader } from "./brigadier_components/string_reader";
import { COMMENT_START, SPACE } from "./consts";
import { DataManager } from "./data/manager";
import { CommandNode, CommandNodePath, Datapack, GlobalData } from "./data/types";
import { createParserInfo, getNextNode, isSuccessful, ReturnHelper } from "./misc_functions";
import { getParser } from "./parsers/get_parser";
import { CommandContext, CommmandData, FunctionInfo, ParseNode, ReturnedInfo, StoredParseResult } from "./types";

const parseExceptions = {
    Ambiguity: new CommandErrorBuilder("parsing.command.ambiguous",
        "Command text is possibly ambiguous", DiagnosticSeverity.Information),
    NoSuccesses: new CommandErrorBuilder("command.parsing.matchless",
        "No nodes which matched '%s' found"),
    NotRunnable: new CommandErrorBuilder("parsing.command.executable",
        "The command '%s' cannot be run.", DiagnosticSeverity.Warning),
};

export function parseCommand(text: string, globalData: GlobalData, localData: Datapack[] | undefined):
    StoredParseResult | void {
    if (text.length === 0 || text.startsWith(COMMENT_START)) {
        return;
    }
    const reader = new StringReader(text);
    const data: CommmandData = { globalData, localData };
    const startingcontext: CommandContext = {};
    const recurse = parsechildren(reader, globalData.commands as any, [], data, startingcontext);
    const nodes: ParseNode[] = [];
    if (isSuccessful(recurse)) {
        nodes.push(...recurse.data);
    }
    return { actions: recurse.actions, nodes, errors: recurse.errors };
}

function parsechildren(reader: StringReader, node: CommandNode,
    path: CommandNodePath, data: CommmandData, context: CommandContext): ReturnedInfo<ParseNode[]> {
    const parent = getNextNode(node, path, data.globalData.commands);
    const helper = new ReturnHelper();
    const children = parent.node.children;
    if (children) {
        const nodes: ParseNode[] = [];
        const start = reader.cursor;
        let successCount = 0;
        let min: number = reader.getTotalLength();
        for (const childKey of Object.keys(children)) {
            const child = children[childKey];
            const childpath = [...parent.path, childKey];
            const result = parseAgainstNode(reader, child, childpath, data, context);
            if (helper.merge(result, false)) {
                successCount++;
                const newNode: ParseNode = { context, low: start, high: reader.cursor, path: childpath };
                const childdata = result.data;
                function checkRead(): boolean {
                    if (reader.canRead()) {
                        return true;
                    } else {
                        if (childdata.node.executable) {
                            helper.addErrors(parseExceptions.NotRunnable.create(0, reader.cursor, reader.string));
                        }
                        return false;
                    }
                }
                if (checkRead()) {
                    if (reader.peek() === SPACE) {
                        reader.skip();
                        if (checkRead()) {
                            const newContext = childdata.newContext ? childdata.newContext : context;
                            const recurse = parsechildren(reader, childdata.node,
                                childpath, data, newContext);
                            if (helper.merge(recurse)) {
                                min = Math.min(min, reader.cursor);
                                nodes.push(...recurse.data);
                            } else {
                                newNode.final = true;
                            }
                        } else {
                            newNode.final = true;
                        }
                        nodes.push(newNode);
                    }
                } else {
                    nodes.push(newNode);
                }
            }
            reader.cursor = start;
        }
        if (successCount === 0) {
            return helper.fail(parseExceptions.NoSuccesses.create(reader.cursor, reader.getTotalLength(),
                reader.getRemaining()));
        }
        if (successCount > 1) {
            helper.addErrors(parseExceptions.Ambiguity.create(start, min));
        }
        return helper.succeed(nodes);
    } else {
        if (!(parent.node as CommandNode).executable) {
            mcLangLog(`Malformed tree at path ${JSON.stringify(path)}. No children and not executable`);
        }
        return helper.fail();
    }
}

interface NodeParseSuccess {
    newContext?: CommandContext;
    max: number;
    node: CommandNode;
}

function parseAgainstNode(reader: StringReader, node: CommandNode,
    path: CommandNodePath, data: CommmandData, context: CommandContext): ReturnedInfo<NodeParseSuccess> {
    const parser = getParser(node);
    const helper = new ReturnHelper();
    if (!!parser) {
        const result = parser.parse(reader, createParserInfo(node, data, path, context, false));
        if (!!result) {
            if (helper.merge(result, false)) {
                const newContext = Object.assign({}, context, result.data);
                return helper.succeed<NodeParseSuccess>({
                    max: reader.cursor, newContext, node,
                });
            } else {
                return helper.fail();
            }
        } else {
            return helper.succeed<NodeParseSuccess>({ max: reader.cursor, node });
        }
    } else {
        return helper.fail();
    }
}

export function parseLines(document: FunctionInfo, data: DataManager,
    emitter: EventEmitter, documentUri: string, lines: number[]) {
    for (const lineNo of lines) {
        const line = document.lines[lineNo];
        const result = parseCommand(line.text, data.globalData, data.getPackFolderData(document.datapack_root));
        line.parseInfo = result ? result : false;
        emitter.emit(`${documentUri}:${lineNo}`);
    }
}

export function parseDocument(document: FunctionInfo, data: DataManager,
    emitter: EventEmitter, documentUri: string) {
    const lines = document.lines.map((_, i) => i);
    parseLines(document, data, emitter, documentUri, lines);
}
