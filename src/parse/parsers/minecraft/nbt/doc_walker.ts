import fs = require("fs");
import path = require("path");
import { NBTTag } from "./tag/nbt_tag";
import { ArrayReader } from "./util/array_reader";

// @ts-ignore
type ValueList = string[];

interface NodeBase {
    currentPath: string;
    description: string;
    suggestions: Array<string |
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

interface CompoundNode {
    type: "compound" | "root";
    child_ref: string[];
    children: { [key: string]: NBTNode };
}

type NBTNode = NoPropertyNode & CompoundNode & ListNode & RefNode & ContextNode;

const rootNodePath = "../../../../../node_modules/mc-nbt-paths/root.json";
export class NBTWalker {

    private arr: ArrayReader;
    private parsed: NBTTag<any>;

    constructor(nbtpath: string[], parsed: NBTTag<any>) {
        this.arr = new ArrayReader(nbtpath);
        this.parsed = parsed;
    }

    public getFinalNode() {
        const rootNode = JSON.parse(fs.readFileSync(rootNodePath).toString()) as NBTNode;
        rootNode.currentPath = rootNodePath;
        return this.getNextNode(rootNode);
    }

    private getNextNode(node: NBTNode): NBTNode | undefined {
        if (this.arr.end() || node === undefined) {
            return node;
        }
        const next = this.arr.peek();
        if (node.ref !== undefined) {
            return this.getNextNode(this.evalRef(node));
        } else if (node.context !== undefined) {
            return this.getNextNode(this.evalContext(node));
        } else if (node.type === "compound") {
            const evalNode = this.evalChildRef(node);
            if (next in evalNode.children) {
                this.arr.skip();
                return this.getNextNode(evalNode.children[next]);
            }
        } else if (node.type === "root") {
            if (next in node.children) {
                this.arr.skip();
                return this.getNextNode(node.children[next]);
            } else {
                for (const k of Object.keys(node.children)) {
                    if (k.startsWith("$")) {
                        const vals = JSON.parse(
                            fs.readFileSync(
                                path.resolve(node.currentPath, k.slice(1)),
                            ).toString(),
                        ) as ValueList;
                        if (vals.indexOf(next) !== -1) {
                            return this.getNextNode(node.children[k]);
                        }
                    }
                }
            }
        }
        return undefined;
    }

    private evalRef(node: NBTNode) {
        return node;
    }

    private evalContext(node: NBTNode) {
        return node;
    }

    private evalChildRef(node: NBTNode) {
        return node;
    }

}
