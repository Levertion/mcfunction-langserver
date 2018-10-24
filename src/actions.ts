import { Interval, IntervalTree } from "node-interval-tree";
import {
    Hover,
    Location,
    Position,
    SignatureHelp,
    SignatureInformation,
    SymbolInformation,
    SymbolKind
} from "vscode-languageserver";

import Uri from "vscode-uri";
import { getAllNodes } from "./completions";
import { COMMENT_START } from "./consts";
import { DataManager } from "./data/manager";
import { CommandNode, CommandTree, MCNode, Resources } from "./data/types";
import {
    buildPath,
    convertToNamespace,
    followPath,
    getNextNode,
    namespaceStart,
    stringifyNamespace
} from "./misc-functions";
import { typed_keys } from "./misc-functions/third_party/typed-keys";
import { blankRange } from "./test/blanks";
import {
    CommandLine,
    FunctionInfo,
    JSONDocInfo,
    ParseNode,
    SubAction
} from "./types";

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
    const json = getActionsOfKind(docLine, pos, "json");
    if (json.length > 0) {
        const doc = json[0].data as JSONDocInfo;
        let result: Hover | null | undefined;
        const position: Position = {
            character: pos.character - json[0].low,
            line: 0
        };
        manager.globalData.jsonService
            .doHover(doc.text, position, doc.json)
            .then(v => (result = v));
        if (result) {
            if (result.range) {
                result.range.start.line = pos.line;
                result.range.end.line = pos.line;
                result.range.start.character += json[0].low;
                result.range.end.character += json[0].low;
            }
            return result;
        }
    }
    const hovers = getActionsOfKind(docLine, pos, "hover");
    if (hovers.length > 0) {
        return computeIntervalHovers(hovers, docLine, pos.line, i =>
            i.map(v => v.data as string)
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
                (childNode.node as CommandTree).type === "root" // Handle automatic root redirect
                    ? child
                    : (childNode.node as CommandNode),
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
                    if (parameterInfo) {
                        result.push(
                            [
                                parameterInfo,
                                ...next.map(
                                    v => (node.executable ? `[${v}]` : v)
                                )
                            ].join(" ")
                        );
                    } else {
                        result.push(
                            next
                                .map(v => (node.executable ? `[${v}]` : v))
                                .join(" ")
                        );
                    }
                    continue;
                }
            }
            if (parameterInfo) {
                result.push(parameterInfo);
            }
        }
        if (depth === 0) {
            return [result.join("|")];
        }
        return result;
    }
    return [];
}

function buildParameterInfoForNode(
    node: CommandNode,
    name: string
): string | undefined {
    return node.type === "literal"
        ? name
        : node.type === "argument"
            ? `<${name}: ${node.parser}>`
            : undefined;
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

export function getWorkspaceSymbols(
    manager: DataManager,
    query: string
): SymbolInformation[] {
    const result: SymbolInformation[] = [];
    const worlds = manager.packData;
    const namespace = convertToNamespace(query);
    for (const worldPath of Object.keys(worlds)) {
        const world = worlds[worldPath];
        for (const packID in world.packs) {
            if (world.packs.hasOwnProperty(packID)) {
                const pack = world.packs[packID];
                for (const type of typed_keys(pack.data)) {
                    const val = pack.data[type];
                    if (val) {
                        for (const item of val) {
                            if (namespaceStart(item, namespace)) {
                                result.push({
                                    kind: symbolKindForResource(type),
                                    location: {
                                        range: blankRange,
                                        uri: Uri.file(buildPath(
                                            item,
                                            world,
                                            type
                                        ) as any).toString()
                                    },
                                    name: stringifyNamespace(item)
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
}

export function symbolKindForResource(resource: keyof Resources): SymbolKind {
    switch (resource) {
        case "block_tags":
        case "function_tags":
        case "item_tags":
            return SymbolKind.Namespace;
        case "advancements":
        case "functions":
        case "loot_tables":
        case "recipes":
        case "structures":
            break;

        default:
    }
    return SymbolKind.Variable;
}
