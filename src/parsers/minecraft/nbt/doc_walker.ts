import fs = require("fs");
import path = require("path");
import url = require("url");
import { runNodeFunction } from "./doc_walker_func";
import {
    CompoundNode,
    FunctionNode,
    isCompoundNode,
    isFunctionNode,
    isListNode,
    isRefNode,
    isRootNode,
    NBTNode,
    RefNode
} from "./doc_walker_util";
import { NBTTag } from "./tag/nbt_tag";
import { ArrayReader } from "./util/array_reader";

export type ValueList = string[];

const rootNodePath = require.resolve("mc-nbt-paths/root.json");

export class NBTWalker {
    private parsed: NBTTag<any>;
    private root: string;

    constructor(parsed: NBTTag<any>, root: string = rootNodePath) {
        this.parsed = parsed;
        this.root = root;
    }

    public getFinalNode(nbtpath: string[]) {
        const rootNode = JSON.parse(
            fs.readFileSync(this.root).toString()
        ) as NBTNode;
        rootNode.currentPath = path.dirname(this.root);
        return this.getNextNode(rootNode, new ArrayReader(nbtpath));
    }

    private getNextNode(
        node: NBTNode | undefined,
        arr: ArrayReader
    ): NBTNode | undefined {
        if (arr.end() && node !== undefined) {
            if (isRefNode(node)) {
                return this.getNextNode(this.evalRef(node), arr);
            } else if (isFunctionNode(node)) {
                return this.getNextNode(this.evalFunction(node, arr), arr);
            }
            return node;
        }
        if (node === undefined) {
            return undefined;
        }
        const next = arr.peek();
        if (isRefNode(node)) {
            return this.getNextNode(this.evalRef(node), arr);
        } else if (isFunctionNode(node)) {
            return this.getNextNode(this.evalFunction(node, arr), arr);
        } else if (isCompoundNode(node)) {
            const evalNode = this.evalChildRef(node);
            if (next in evalNode.children) {
                const nextNode = evalNode.children[next];
                arr.skip();
                if (!nextNode.currentPath) {
                    nextNode.currentPath = node.currentPath;
                }
                return this.getNextNode(evalNode.children[next], arr);
            }
        } else if (isRootNode(node)) {
            if (next in node.children) {
                arr.skip();
                return this.getNextNode(node.children[next], arr);
            } else {
                for (const k of Object.keys(node.children)) {
                    if (k.startsWith("$")) {
                        const vals = JSON.parse(
                            fs
                                .readFileSync(
                                    path.resolve(node.currentPath, k.slice(1))
                                )
                                .toString()
                        ) as ValueList;
                        if (vals.indexOf(next) !== -1) {
                            return this.getNextNode(node.children[k], arr);
                        }
                    }
                }
            }
        } else if (isListNode(node)) {
            if (/\d+/.test(next)) {
                arr.skip();
                node.item.currentPath = node.currentPath;
                return node.item;
            }
        } else {
            return node;
        }
        return undefined;
    }

    private evalRef(node: RefNode): NBTNode | undefined {
        const refUrl = url.parse(node.ref);
        const fragPath = (refUrl.hash || "#")
            .slice(1)
            .split("/")
            .filter(v => v !== "");
        const fragReader = new ArrayReader(fragPath);
        const newNode = JSON.parse(
            fs.readFileSync(path.resolve(node.currentPath, node.ref)).toString()
        ) as NBTNode;
        const evalNode = this.getNextNode(newNode, fragReader);
        if (evalNode === undefined) {
            return undefined;
        }
        return evalNode;
    }

    private evalFunction(node: FunctionNode, arr: ArrayReader) {
        const newNode: RefNode = {
            currentPath: node.currentPath,
            ref: runNodeFunction(
                this.parsed,
                arr.getRead(),
                node,
                node.function.params
            )
        };
        return this.evalRef(newNode);
    }

    private evalChildRef(node: CompoundNode): CompoundNode {
        if (!node.child_ref || node === undefined) {
            return node;
        }
        const copyNode = JSON.parse(JSON.stringify(node)) as CompoundNode;
        if (!copyNode.children) {
            copyNode.children = {};
        }
        for (const s of node.child_ref) {
            const currentPath = path.resolve(node.currentPath, s);
            const refNode = this.evalRef({
                currentPath: node.currentPath,
                ref: currentPath
            });
            if (!!refNode && isCompoundNode(refNode)) {
                for (const c of Object.keys(refNode.children)) {
                    const newChild = JSON.parse(
                        JSON.stringify(refNode.children[c])
                    ) as NBTNode;
                    newChild.currentPath = currentPath;
                    copyNode.children[c] = newChild;
                }
            }
        }
        return copyNode;
    }
}
