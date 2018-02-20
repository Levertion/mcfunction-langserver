import fs = require("fs");
import path = require("path");
import sprintf = require("sprintf-js");
import url = require("url");
import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTagList } from "./tag/list_tag";
import { NBTTag } from "./tag/nbt_tag";
import { ArrayReader } from "./util/array_reader";

// @ts-ignore
type ValueList = string[];

interface NodeBase {
    currentPath: string;
    description?: string;
    suggestions?: Array<string |
    { value: string, description: string } |
    { values: string }
    >;
}

interface NoPropertyNode extends NodeBase {
    type: "no-nbt" |
    "byte" | "short" | "int" | "long" | "float" | "double" |
    "byte_array" | "string" | "int_array" | "long_array";
}

interface RefNode extends NodeBase {
    ref: string;
}

interface ContextNode extends NodeBase {
    context: {
        ref_dict: Array<
        { name: string, nbt_ref: string } |
        { name: string, info_name: "id" | "type" }
        >;
        ref: string;
        default: string;
    };
}

interface ListNode extends NodeBase {
    type: "list";
    item: NBTNode;
}

interface CompoundNode extends NodeBase {
    type: "compound" | "root";
    child_ref: string[];
    children: { [key: string]: NBTNode };
}

type NBTNode = NoPropertyNode | CompoundNode | ListNode | RefNode | ContextNode;

function getNBTTagFromTree(tag: NBTTag<any>, nbtPath: string[]) {
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

function isContextNode(node: NBTNode): node is ContextNode {
    return "context" in node;
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

const rootNodePath = "../../../../../node_modules/mc-nbt-paths/root.json";
export class NBTWalker {

    private parsed: NBTTag<any>;

    constructor(parsed: NBTTag<any>) {
        this.parsed = parsed;
    }

    public getFinalNode(nbtpath: string[]) {
        const rootNode = JSON.parse(fs.readFileSync(rootNodePath).toString()) as NBTNode;
        rootNode.currentPath = rootNodePath;
        return this.getNextNode(rootNode, new ArrayReader(nbtpath));
    }

    private getNextNode(node: NBTNode | undefined, arr: ArrayReader): NBTNode | undefined {
        if (arr.end() || node === undefined) {
            return node;
        }
        const next = arr.peek();
        if (isRefNode(node)) {
            return this.getNextNode(this.evalRef(node), arr);
        } else if (isContextNode(node)) {
            return this.getNextNode(this.evalContext(node, arr), arr);
        } else if (isCompoundNode(node)) {
            const evalNode = this.evalChildRef(node);
            evalNode.currentPath = node.currentPath;
            if (next in evalNode.children) {
                arr.skip();
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

    private evalRef(node: RefNode) {
        const refUrl = url.parse(node.ref);
        const fragPath = (refUrl.hash || "#").slice(1).split("/");
        const fragReader = new ArrayReader(fragPath);
        const newNode = JSON.parse(fs.readFileSync(path.resolve(node.currentPath, node.ref)).toString()) as NBTNode;
        const evalNode = this.getNextNode(newNode, fragReader);
        if (evalNode === undefined) {
            return undefined;
        }
        evalNode.suggestions = node.suggestions;
        evalNode.description = node.description;
        return evalNode;
    }

    private evalContext(node: ContextNode, arr: ArrayReader) {
        const formatDict: { [key: string]: string } = {};
        let i = 0;
        let useRef = true;
        for (const e of node.context.ref_dict) {
            if ("nbt_ref" in node.context.ref_dict[i]) {
                const read = arr.getRead();
                // @ts-ignore It says that there nbt_ref is not on node.context.ref_dict[i] for some reason (╯°□°）╯︵ ┻━┻
                const newPath = path.posix.resolve(read.join("/"), node.context.ref_dict[i].nbt_ref).split("/");
                const tag = getNBTTagFromTree(this.parsed, newPath);
                if (tag === undefined) {
                    useRef = false;
                    break;
                } else {
                    formatDict[e.name] = tag.getVal().toString();
                }
            } else {
                // info_name
            }
            i++;
        }
        if (useRef) {
            const formatString = sprintf.sprintf(node.context.ref, formatDict);
            if (fs.existsSync(formatString)) {
                const refNodeData: RefNode = {
                    currentPath: node.currentPath,
                    description: node.description,
                    ref: formatString,
                    suggestions: node.suggestions,
                };
                return this.evalRef(refNodeData);
            }
        }
        const refDataNode: RefNode = {
            currentPath: node.currentPath,
            description: node.description,
            ref: node.context.default,
            suggestions: node.suggestions,
        };
        return this.evalRef(refDataNode);
    }

    private evalChildRef(node: CompoundNode): CompoundNode {
        return node;
    }

}
