import { DiagnosticSeverity } from "vscode-languageserver/lib/main";
import { CommandError, CommandErrorBuilder, isCommandError } from "../brigadier_components/errors";
import { StringReader } from "../brigadier_components/string_reader";
import { Resources } from "../data/datapack_resources";
import { CommandNode, CommandNodePath, CommandTree, GlobalData, MCNode } from "../data/types";
import { CommmandData, ParsedInfo, ParseNode, ParseResult, SubAction } from "../types";
import { ContextInformation, runContextHandlers, shouldChangeContext } from "./context";
import { buildInfoForParsers, getNodeAlongPath } from "./node_management";
import { getParser } from "./parsers/get_parser";

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
    path: CommandNodePath, data: CommmandData): ParsedInfo {
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
    nodePath: CommandNodePath, data: CommmandData): ParsedInfo {
    const parent = getNextNode(node, nodePath, data.globalData.commands as CommandTree).node;
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
            const result = parseAgainstNode(reader, childNode, data, childName, nodePath, nodes);
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

function parseAgainstNode(
    reader: StringReader,
    node: CommandNode,
    data: CommmandData,
    key: string, path: string[],
    nodes: ParseNode[],
): ParseResult {
    const nodeInfo = buildInfoForParsers(node, data, key);
    const parser = getParser(node);
    if (!parser) {
        return { successful: false };
    }
    try {
        const contextInfo: ContextInformation = { changeContext: false, handlerInfo: undefined };

        const lineStr = reader.string;

        contextInfo.changeContext = shouldChangeContext(path);
        contextInfo.handlerInfo = runContextHandlers(
            path,
            nodes.map((v) => lineStr.substring(v.low, v.high)),
        );

        const result = parser.parse(reader, nodeInfo, contextInfo);
        if (result === undefined) {
            return { successful: true };
        } else {
            return result;
        }
    } catch (error) {
        if (isCommandError(error)) {
            return { successful: false, errors: [error] };
        } else {
            mcLangLog(`Got unexpected error '${JSON.stringify(error)}' when parsing '${JSON.stringify(node)}'`);
            return { successful: false };
        }
    }
}

export function parseCommand(command: string, globalData: GlobalData, localData?: Resources): ParsedInfo {
    if (command.length > 0 && !command.startsWith("#")) {
        const reader = new StringReader(command);
        const data: CommmandData = { globalData, localData };
        return recursiveParse(reader, globalData.commands as CommandTree, [], data);
    } else {
        return { actions: [], errors: [], nodes: [] };
    }
}
//#region GetNextNode
export function getNextNode(node: CommandNode |
    MCNode<CommandNode>, nodePath: CommandNodePath, tree: CommandTree): GetNodeResult {
    // @ts-ignore The compiler complains oddly that McNode<CommandNode> doesn't have redirect defined.
    if (!!node.redirect) {
        // @ts-ignore
        return { node: getNodeAlongPath(tree, node.redirect), path: node.redirect };
    } else {
        return { node, path: nodePath };
    }
}

interface GetNodeResult {
    node: MCNode<CommandNode>;
    path: CommandNodePath;
}
//#endregion
