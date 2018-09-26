import { Interval, IntervalTree } from "node-interval-tree";
import { Hover, Location, Position } from "vscode-languageserver";
import Uri from "vscode-uri";

import { DataManager } from "./data/manager";
import { CommandNode } from "./data/types";
import { followPath } from "./misc-functions";
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
