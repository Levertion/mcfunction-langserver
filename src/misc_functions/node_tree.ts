import { CommandNode, CommandNodePath, CommandTree, MCNode } from "../data/types";

export function followPath<T extends MCNode<T>>(tree: MCNode<T>, path: CommandNodePath): MCNode<T> {
    // There are no protections here, because if a path is given it should be correct.
    let current = tree;
    for (const section of path) {
        if (!!current.children && !!current.children[section]) {
            current = current.children[section];
        }
    }
    return current;
}

export function getNextNode(node: CommandNode | MCNode<CommandNode>
    & { redirect?: CommandNodePath }, // Allow use of node.redirect without a tsignore
    nodePath: CommandNodePath, tree: CommandTree): GetNodeResult {
    const redirect: CommandNodePath | undefined = node.redirect;
    if (!!redirect) {
        return { node: followPath(tree, redirect), path: redirect };
    } else {
        return { node, path: nodePath };
    }
}

interface GetNodeResult {
    node: MCNode<CommandNode>;
    path: CommandNodePath;
}
