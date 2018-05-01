import { EventEmitter } from "events";
import { DiagnosticSeverity } from "vscode-languageserver/lib/main";

import { emit } from "cluster";
import { CommandError, CommandErrorBuilder, isCommandError } from "./brigadier_components/errors";
import { StringReader } from "./brigadier_components/string_reader";
import { DataManager } from "./data/manager";
import { CommandNode, CommandNodePath, CommandTree, Datapack, GlobalData, MCNode } from "./data/types";
import { createParserInfo } from "./misc_functions/creators";
import { getNextNode } from "./misc_functions/node_tree";
import { ReturnHelper } from "./misc_functions/returnhelper";
import { getParser } from "./parsers/get_parser";
import {
    CommandContext, CommmandData, ContextChange, FunctionInfo,
    ParseNode, ReturnedInfo, StoredParseResult, SubAction,
} from "./types";

const ParseExceptions = {
    NoSpace: new CommandErrorBuilder("parsing.command.whitespace",
        "Expected whitespace, got '%s'"),
    NoSuccesses:
        new CommandErrorBuilder("command.parsing.matchless",
            "No nodes which matched '%s' found"),
    NotRunnable: new CommandErrorBuilder("parsing.command.executable",
        "The command '%s' cannot be run.", DiagnosticSeverity.Warning),
};

function recursiveParse(reader: StringReader, node: MCNode<CommandNode>,
    path: CommandNodePath, data: CommmandData): StoredParseResult {
    const begin = reader.cursor;
    const result = parseAgainstChildren(reader, node, path, data);
    const actions: SubAction[] = result.actions;
    const errors: CommandError[] = result.errors;
    const nodes = [];
    let spaceissue: { start: number, character: string } | undefined;
    for (const success of result.nodes) {
        if (!!node.children) {
            reader.cursor = success.high;
            const key = success.path[success.path.length - 1];
            const child = node.children[key];
            const checkCanRead = (): boolean => {
                if (!reader.canRead()) {
                    if (!child.executable) {
                        errors.push(ParseExceptions.NotRunnable.create(0, reader.cursor, reader.string));
                    }
                    return false;
                } else {
                    return true;
                }
            };
            if (checkCanRead()) {
                if (reader.peek() === " ") {
                    reader.skip();
                    let successCount = 0;
                    if (checkCanRead()) {
                        const recursiveResult = recursiveParse(reader, child, success.path, data);
                        actions.push(...recursiveResult.actions);
                        nodes.push(...recursiveResult.nodes);
                        errors.push(...recursiveResult.errors);
                        successCount = recursiveResult.nodes.length;
                    }
                    if (successCount === 0) {
                        success.final = true;
                    }
                    nodes.push(success);
                } else {
                    spaceissue = { start: reader.cursor, character: reader.peek() };
                }
            } else {
                nodes.push(success);
            }
        }
    }
    if (nodes.length === 0) {
        if (!!spaceissue) {
            errors.push(ParseExceptions.NoSpace.create(spaceissue.start, spaceissue.start + 1, spaceissue.character));
        } else {
            errors.push(ParseExceptions.NoSuccesses.create(begin, reader.string.length,
                reader.string.substring(begin, reader.string.length)));
        }
    }
    return { actions, errors, nodes };
}

function parseAgainstChildren(reader: StringReader, node: MCNode<CommandNode>,
    nodePath: CommandNodePath, data: CommmandData): StoredParseResult {
    const parent = getNextNode(node, nodePath, data.globalData.commands).node;
    if (!!parent.children) {
        const nodes: ParseNode[] = [];
        const errors: CommandError[] = [];
        const actions: SubAction[] = [];
        const children = Object.keys(parent.children);
        const start = reader.cursor;
        for (const childName of children) {
            reader.cursor = start;
            const newPath = nodePath.slice(); newPath.push(childName);
            const childNode = parent.children[childName];
            const result = parseAgainstNode(reader, childNode, data, childName);
            if (!!result.errors) {
                errors.push(...result.errors);
            }
            if (result.successful) {
                nodes.push({ path: newPath, low: start, high: reader.cursor });
            }
            if (!!result.actions) {
                actions.push(...result.actions);
            }
        }
        return { nodes, errors, actions };
    } else {
        return { nodes: [], errors: [], actions: [] };
    }
}

function parseAgainstNode(reader: StringReader, node: CommandNode,
    data: CommmandData, key: string, context: CommandContext): ReturnedInfo<ContextChange> {
    const returner = new ReturnHelper();
    const nodeInfo = createParserInfo(node, data, key);
    const parser = getParser(node);
    if (!parser) {
        return returner.fail();
    }
    try {
        const result = parser.parse(reader, nodeInfo);
        if (result === undefined) {
            return returner.succeed({});
        }
        if (returner.merge(result)) {
            return returner.succeed(result.data);
        } else {
            return returner.fail();
        }
    } catch (error) {
        if (isCommandError(error)) {
            return returner.fail(error);
        } else {
            mcLangLog(`Got unexpected error '${JSON.stringify(error)}' when parsing '${JSON.stringify(node)}'`);
            return returner.fail();
        }
    }
}

export function parseCommand(command: string, globalData: GlobalData, localData?: Datapack[]): StoredParseResult {
    if (command.length > 0 && !command.startsWith("#")) {
        const reader = new StringReader(command);
        const data: CommmandData = { globalData, localData };
        return recursiveParse(reader, globalData.commands as CommandTree, [], data);
    } else {
        return { actions: [], errors: [], nodes: [] };
    }
}
export function parseLines(document: FunctionInfo, data: DataManager,
    emitter: EventEmitter, documentUri: string, lines: number[]) {

    for (const lineNo of lines) {
        const line = document.lines[lineNo];
        const result = parseCommand(line.text, data.globalData, data.getPackFolderData(document.datapack_root));
        line.parseInfo = result;
        emitter.emit(`${documentUri}:${lineNo}`);
    }
}
export function parseDocument(document: FunctionInfo, data: DataManager,
    emitter: EventEmitter, documentUri: string) {
    const lines = document.lines.map((_, i) => i);
    parseLines(document, data, emitter, documentUri, lines);
}
