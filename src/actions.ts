import { Interval, IntervalTree } from "node-interval-tree";
import {
    Hover,
    Location,
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
            const activeSignature =
                line.text.length > 0
                    ? Math.max(
                          sigs.findIndex(v => v.label.startsWith(line.text)),
                          0
                      )
                    : 0;
            return {
                activeParameter: 0,
                activeSignature,
                signatures: sigs
            };
        } else {
            return undefined;
        }
    }

    let text = "";
    const { finals, internals } = getAllNodes(nodes, pos.character);
    const signatures: SignatureInformation[] = [];
    for (const finalNode of finals) {
        const result = getSignatureHelp(finalNode.path, manager);
        if (result) {
            signatures.push(...result);
        }
        const currentText = line.text.slice(finalNode.high + 1);
        if (currentText.length > text.length) {
            text = currentText;
        }
    }
    for (const internalNode of internals) {
        const pth = internalNode.path.slice();
        if (pth.length > 0) {
            pth.splice(pth.length - 1);
            const result = getSignatureHelp(pth, manager);
            if (result) {
                signatures.push(...result);
            }
            const currentText = line.text.slice(
                internalNode.low,
                internalNode.high
            );
            if (currentText.length > text.length) {
                text = currentText;
            }
        }
    }
    if (signatures.length > 0) {
        const activeSignature =
            text.length > 0
                ? Math.max(
                      signatures.findIndex(v => v.label.startsWith(text)),
                      0
                  )
                : 0;
        return { signatures, activeParameter: 0, activeSignature };
    }
    return undefined;
}

function buildSignatureHelpForChildren(
    node: MCNode<CommandNode> & Partial<CommandNode>,
    path: string[],
    commands: CommandTree,
    depth: number
): string[] {
    if (node.children) {
        const result: string[] = [];
        for (const childName of Object.keys(node.children)) {
            const child = node.children[childName];
            const childPath = [...path, childName];
            const childNode = getNextNode(child, childPath, commands);
            const parameterInfo = buildParameterInfoForNode(
                childNode.node as CommandNode,
                childName
            );
            if (depth > 0) {
                const next = buildSignatureHelpForChildren(
                    childNode.node,
                    childNode.path,
                    commands,
                    node.executable ? depth - 1 : 0
                );
                if (next.length > 0) {
                    result.push(
                        [
                            parameterInfo,
                            ...next.map(v => (node.executable ? `[${v}]` : v))
                        ].join(" ")
                    );
                    continue;
                }
            }
            result.push(parameterInfo);
        }
        if (depth === 0) {
            return [result.join("|")];
        }
        return result;
    }
    return [];
}

function buildParameterInfoForNode(node: CommandNode, name: string): string {
    return node.type === "literal"
        ? name
        : node.type === "argument"
            ? `<${name}: ${node.parser}>`
            : `root`;
}

// Arbritrary number used to calculate the max length of the line
const SIZE = 50;
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
    for (const option of options) {
        result.push(buildSignature(option, path));
    }
    return result;
}

function buildSignature(option: string, path: string[]): SignatureInformation {
    if (option.length > SIZE) {
        let index = option.lastIndexOf("|", SIZE);
        if (index === -1) {
            index = SIZE;
        }
        return {
            documentation: `${option
                .slice(index)
                .replace("|", "\t(pipe) ")
                .replace(/\|/g, "\n\t| ")
                .replace("(pipe)", "|")}\n\nCommand at path ${path.join()}`,
            label: `${option.slice(0, SIZE)}...`
        };
    } else {
        return {
            documentation: `Command at path '${path.join()}'`,
            label: option
        };
    }
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
