import { CommandNode, CommandNodePath, MCNode } from "../data/types";
import { CommmandData, ParserInfo } from "../types";

export function getNodeAlongPath<T extends MCNode<T>>(tree: MCNode<T>, path: CommandNodePath): MCNode<T> {
    let current = tree;
    for (const section of path) {
        if (!!current.children && !!current.children[section]) {
            current = current.children[section];
        }
    }
    return current;
}

export function buildInfoForParsers(node: CommandNode, data: CommmandData, key: string): ParserInfo {
    const result: ParserInfo = {
        data,
        key,
        node_properties: node.properties || {},
    };
    return result;
}
