import { CommandNode, CommandNodePath, CommandTree, MCNode } from "../data/types";

export function followPath<T extends MCNode<T>>(tree: MCNode<T>, path: CommandNodePath): MCNode<T> {
    let current = tree;
    for (const section of path) {
        if (!!current.children && !!current.children[section]) {
            current = current.children[section];
        }
    }
    return current;
}

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
