import * as path from "path";
import * as url from "url";
import { NBTTagCompound } from "../tag/compound-tag";
import { NBTTagList } from "../tag/list-tag";
import { NBTTag } from "../tag/nbt-tag";

export interface NBTFunction {
    id: string;
    params: any;
}

export interface NodeBase {
    readonly description?: string;
    readonly references?: { [key: string]: any };
    readonly suggestions?: Array<
        | string
        | { description?: string; value: string }
        | { function: NBTFunction }
    >;
}

export interface NoPropertyNode extends NodeBase {
    readonly type:
        | "no-nbt"
        | "byte"
        | "short"
        | "int"
        | "long"
        | "float"
        | "double"
        | "byte_array"
        | "string"
        | "int_array"
        | "long_array";
}

export interface RefNode extends NodeBase {
    readonly ref: string;
}

export interface FunctionNode extends NodeBase {
    readonly function: NBTFunction;
}

export interface ListNode extends NodeBase {
    readonly item: NBTNode;
    readonly type: "list";
}

export interface CompoundNode extends NodeBase {
    readonly child_ref?: string[];
    readonly children?: { [key: string]: NBTNode };
    readonly type: "compound";
}

export interface RootNode extends NodeBase {
    readonly children: { [key: string]: NBTNode };
    readonly type: "root";
}

export type ValueList = Array<string | { description: string; value: string }>;

export type NBTNode =
    | NoPropertyNode
    | CompoundNode
    | RootNode
    | ListNode
    | RefNode
    | FunctionNode;

export const parseRefPath = (
    ref: string,
    currentPath: string
): [string, string[]] => {
    const cpd = path.dirname(currentPath);
    const refurl = url.parse(ref);
    const fragPath = (refurl.hash || "#")
        .substring(1)
        .split("/")
        .filter(v => v !== "");
    const nextPath = path.join(cpd, refurl.path || path.basename(currentPath));
    return [nextPath, fragPath];
};

export function getNBTTagFromTree(
    tag: NBTTag<any>,
    nbtPath: string[]
): NBTTag<any> | undefined {
    let lastTag = tag;
    for (const s of nbtPath) {
        if (lastTag.tagType === "list" && /\d+/.test(s)) {
            lastTag = (tag as NBTTagList).getVal()[parseInt(s, 10)];
        } else if (lastTag.tagType === "compound") {
            lastTag = (tag as NBTTagCompound).getVal()[s];
        } else {
            return undefined;
        }
    }
    return lastTag;
}

export function isRefNode(node: NBTNode): node is RefNode {
    return "ref" in node;
}

export function isFunctionNode(node: NBTNode): node is FunctionNode {
    return "function" in node;
}

export function isTypedNode(
    node: NBTNode
): node is NoPropertyNode | CompoundNode | ListNode | RootNode {
    return "type" in node;
}

export function isCompoundNode(node: NBTNode): node is CompoundNode {
    return isTypedNode(node) && node.type === "compound";
}

export function isRootNode(node: NBTNode): node is RootNode {
    return isTypedNode(node) && node.type === "root";
}

export function isListNode(node: NBTNode): node is ListNode {
    return isTypedNode(node) && node.type === "list";
}
