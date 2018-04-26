import { CommandNodePath, MCNode } from "../data/types";

export function followPath<T extends MCNode<T>>(tree: MCNode<T>, path: CommandNodePath): MCNode<T> {
    let current = tree;
    for (const section of path) {
        if (!!current.children && !!current.children[section]) {
            current = current.children[section];
        }
    }
    return current;
}
