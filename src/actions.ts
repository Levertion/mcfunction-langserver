import { Interval, IntervalTree } from "node-interval-tree";
import {
    Hover,
    Location,
    ParameterInformation,
    Position,
    SignatureHelp,
    SignatureInformation
} from "vscode-languageserver";

import Uri from "vscode-uri";
import { getAllNodes } from "./completions";
import { COMMENT_START } from "./consts";
import { DataManager } from "./data/manager";
import { CommandNode, CommandTree, MCNode } from "./data/types";
import { followPath, getNextNode } from "./misc-functions";
import { CommandLine, FunctionInfo, ParseNode, SubAction } from "./types";

export function hoverProvider(
    docLine: CommandLine,
    pos: Position,
    _: FunctionInfo,
    manager: DataManager
): Hover | undefined {
    function computeIntervalHovers<T extends Interval>(
        intervals: T[],
        commandLine: CommandLine,
        line: number,
        map: (intervals: T[]) => Hover["contents"]
    ): Hover {
        const end: Position = {
            character: intervals.reduce((acc, v) => Math.max(acc, v.high), 0),
            line
        };
        const start: Position = {
            character: intervals.reduce(
                (acc, v) => Math.min(acc, v.low),
                commandLine.text.length
            ),
            line
        };
        return { contents: map(intervals), range: { start, end } };
    }
    const hovers = getActionsOfKind(docLine, pos, "hover");
    if (hovers.length > 0) {
        return computeIntervalHovers(hovers, docLine, pos.line, i =>
            i.map(v => v.data)
        );
    } else {
        const tree = getNodeTree(docLine);
        if (tree) {
            const matching = tree.search(pos.character, pos.character);
            if (matching.length > 0) {
                return computeIntervalHovers(matching, docLine, pos.line, i =>
                    i.map<string>(node => {
                        const data = followPath(
                            manager.globalData.commands,
                            node.path
                        ) as CommandNode;
                        return `${
                            data.type === "literal"
                                ? "literal"
                                : `\`${data.parser}\` parser`
                        } on path '${node.path.join(", ")}'`;
                    })
                );
            }
        }
    }
    return undefined;
}

export function definitionProvider(
    docLine: CommandLine,
    pos: Position
): Location[] {
    if (docLine) {
        const actions = getActionsOfKind(docLine, pos, "source");
        const start: Position = { line: 0, character: 0 };
        return actions.map<Location>(a => ({
            range: { start, end: start },
            uri: Uri.file(a.data as any).toString()
        }));
    }
    return [];
}

export function signatureHelpProvider(
    line: CommandLine,
    pos: Position,
    _: FunctionInfo,
    manager: DataManager
): SignatureHelp | undefined {
    if (line.parseInfo === undefined || line.text.startsWith(COMMENT_START)) {
        return undefined;
    }
    const nodes = line.parseInfo ? line.parseInfo.nodes : [];
    if (nodes.length === 0) {
        const sigs = getSignatureHelp([], manager);
        if (sigs) {
            return {
                activeParameter: 0,
                activeSignature: 0,
                signatures: sigs
            };
        } else {
            return undefined;
        }
    }
    const { finals, internals } = getAllNodes(nodes, pos.character);
    const signatures: SignatureInformation[] = [];
    for (const finalNode of finals) {
        const result = getSignatureHelp(finalNode.path, manager);
        if (result) {
            signatures.push(...result);
        }
    }
    const activeSignature = 0;
    for (const internalNode of internals) {
        const pth = internalNode.path.slice();
        if (pth.length > 0) {
            pth.splice(0, pth.length - 1);
            const result = getSignatureHelp(pth, manager);
            if (result) {
                signatures.push(...result);
            }
        }
    }
    if (signatures.length > 0) {
        return { signatures, activeParameter: 0, activeSignature };
    }
    return undefined;
}

function buildSignatureHelpForChildren(
    node: MCNode<CommandNode> & Partial<CommandNode>,
    path: string[],
    commands: CommandTree,
    depth: number
): ParameterInformation[][] {
    if (node.children) {
        const result: ParameterInformation[][] = [];
        for (const childName of Object.keys(node.children)) {
            const child = node.children[childName];
            const childPath = [...path, childName];
            const childNode = getNextNode(child, childPath, commands);
            const parameterInfo = buildParameterInfoForNode(
                childNode.node as CommandNode,
                childName,
                !!node.executable
            );
            if (depth > 0) {
                const next = buildSignatureHelpForChildren(
                    childNode.node,
                    childNode.path,
                    commands,
                    depth - 1
                );
                if (next.length > 0) {
                    for (const option of next) {
                        result.push([parameterInfo, ...option]);
                    }
                    continue;
                }
            }
            result.push([parameterInfo]);
        }
        return result;
    }
    return [];
}

function buildParameterInfoForNode(
    node: CommandNode,
    name: string,
    optional: boolean
): ParameterInformation {
    const val =
        node.type === "literal"
            ? name
            : node.type === "argument"
                ? `<${name}: ${node.parser}>`
                : `root`;
    return { label: optional ? `[${val}]` : val };
}

function getSignatureHelp(
    path: string[],
    manager: DataManager
): SignatureInformation[] {
    const commands = manager.globalData.commands;
    const next = getNextNode(followPath(commands, path), path, commands);
    const options = buildSignatureHelpForChildren(
        next.node,
        next.path,
        commands,
        2
    );
    const result: SignatureInformation[] = [];
    for (const parameters of options) {
        result.push({
            label: `Command at path: '${path.join()}'`,
            parameters
        });
    }
    return result;
}

function getActionsOfKind(
    line: CommandLine,
    position: Position,
    kind: SubAction["type"]
): SubAction[] {
    if (line.parseInfo) {
        if (!line.actions) {
            line.actions = new IntervalTree();
            for (const action of line.parseInfo.actions) {
                line.actions.insert(action);
            }
        }
        const tree = line.actions;
        return tree
            .search(position.character, position.character)
            .filter(v => v.type === kind);
    }
    return [];
}

function getNodeTree(line: CommandLine): IntervalTree<ParseNode> | undefined {
    if (line.nodes) {
        return line.nodes;
    }
    if (line.parseInfo) {
        const tree = new IntervalTree<ParseNode>();
        for (const node of line.parseInfo.nodes) {
            tree.insert(node);
        }
        return tree;
    }
    return undefined;
}
