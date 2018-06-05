import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTagList } from "./tag/list_tag";
import { NBTTag } from "./tag/nbt_tag";

export interface NBTFunction {
    id: string;
    params: any;
}

export interface NodeBase {
    currentPath: string;
    description?: string;
    suggestions?: Array<
        | string
        | { description?: string; value: string }
        | { function: NBTFunction }
    >;
}

export interface NoPropertyNode extends NodeBase {
    type:
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
    ref: string;
}

export interface FunctionNode extends NodeBase {
    function: NBTFunction;
}

export interface ListNode extends NodeBase {
    item: NBTNode;
    type: "list";
}

export interface CompoundNode extends NodeBase {
    child_ref: string[];
    children: { [key: string]: NBTNode };
    type: "compound" | "root";
}

export type NBTNode =
    | NoPropertyNode
    | CompoundNode
    | ListNode
    | RefNode
    | FunctionNode;

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
): node is NoPropertyNode | CompoundNode | ListNode {
    return "type" in node;
}

export function isCompoundNode(node: NBTNode): node is CompoundNode {
    return isTypedNode(node) && node.type === "compound";
}

export function isRootNode(node: NBTNode): node is CompoundNode {
    return isTypedNode(node) && node.type === "root";
}

export function isListNode(node: NBTNode): node is ListNode {
    return isTypedNode(node) && node.type === "list";
}
