import fs = require("fs");
import path = require("path");
import url = require("url");
import { runFunction } from "./doc_walker_func";
import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTagList } from "./tag/list_tag";
import { NBTTag } from "./tag/nbt_tag";
import { ArrayReader } from "./util/array_reader";

type ValueList = string[];

export interface NBTFunction {
    id: string;
    params: any;
}

export interface NodeBase {
    currentPath: string;
    description?: string;
    suggestions?: Array<string |
    { value: string, description: string } |
    { values: string } |
    { function: NBTFunction }
    >;
}

export interface NoPropertyNode extends NodeBase {
    type: "no-nbt" |
    "byte" | "short" | "int" | "long" | "float" | "double" |
    "byte_array" | "string" | "int_array" | "long_array";
}

interface RefNode extends NodeBase {
    ref: string;
}

export interface FunctionNode extends NodeBase {
    function: NBTFunction;
}

export interface ListNode extends NodeBase {
    type: "list";
    item: NBTNode;
}

export interface CompoundNode extends NodeBase {
    type: "compound" | "root";
    child_ref: string[];
    children: { [key: string]: NBTNode };
}

export type NBTNode = NoPropertyNode | CompoundNode | ListNode | RefNode | FunctionNode;

export function getNBTTagFromTree(tag: NBTTag<any>, nbtPath: string[]) {
    let lastTag = tag;
    for (const s of nbtPath) {
        if (lastTag === undefined) {
            return undefined;
        } else if (lastTag.tagType === "list" && /\d+/.test(s)) {
            lastTag = (tag as NBTTagList).getVal()[parseInt(s, 10)];
        } else if (lastTag.tagType === "compound") {
            lastTag = (tag as NBTTagCompound).getVal()[s];
        } else {
            return undefined;
        }
    }
    return lastTag;
}

function isRefNode(node: NBTNode): node is RefNode {
    return "ref" in node;
}

function isFunctionNode(node: NBTNode): node is FunctionNode {
    return "function" in node;
}

function isTypedNode(node: NBTNode): node is NoPropertyNode | CompoundNode | ListNode {
    return "type" in node;
}

function isCompoundNode(node: NBTNode): node is CompoundNode {
    return isTypedNode(node) && node.type === "compound";
}

function isRootNode(node: NBTNode): node is CompoundNode {
    return isTypedNode(node) && node.type === "root";
}

function isListNode(node: NBTNode): node is ListNode {
    return isTypedNode(node) && node.type === "list";
}

const rootNodePath = require.resolve("mc-nbt-paths/root.json");

export class NBTWalker {

    private parsed: NBTTag<any>;
    private root: string;

    constructor(parsed: NBTTag<any>, root: string = rootNodePath) {
        this.parsed = parsed;
        this.root = root;
    }

    public getFinalNode(nbtpath: string[]) {
        const rootNode = JSON.parse(fs.readFileSync(this.root).toString()) as NBTNode;
        rootNode.currentPath = path.dirname(this.root);
        return this.getNextNode(rootNode, new ArrayReader(nbtpath));
    }

    private getNextNode(node: NBTNode | undefined, arr: ArrayReader): NBTNode | undefined {
        if (arr.end() && node !== undefined) {
            if (isRefNode(node)) {
                return this.getNextNode(this.evalRef(node), arr);
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
                            fs.readFileSync(
                                path.resolve(node.currentPath, k.slice(1)),
                            ).toString(),
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
        const fragPath = (refUrl.hash || "#").slice(1).split("/").filter((v) => v !== "");
        const fragReader = new ArrayReader(fragPath);
        const newNode = JSON.parse(fs.readFileSync(path.resolve(node.currentPath, node.ref)).toString()) as NBTNode;
        const evalNode = this.getNextNode(newNode, fragReader);
        if (evalNode === undefined) {
            return undefined;
        }
        return evalNode;
    }

    private evalFunction(node: FunctionNode, arr: ArrayReader) {
        const newNode: RefNode = {
            currentPath: node.currentPath,
            ref: runFunction(this.parsed, arr.getRead(), node, node.function.params),
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
                ref: currentPath,
            });
            if (!!refNode && isCompoundNode(refNode)) {
                for (const c of Object.keys(refNode.children)) {
                    const newChild = JSON.parse(JSON.stringify(refNode.children[c])) as NBTNode;
                    newChild.currentPath = currentPath;
                    copyNode.children[c] = newChild;
                }
            }
        }
        return copyNode;
    }

}
