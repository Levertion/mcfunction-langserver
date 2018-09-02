import { posix as path } from "path";
import * as url from "url";
import { MemoryFS } from "./doc-fs";
import { runNodeFunction } from "./doc-walker-func";
import { NBTTag } from "./tag/nbt-tag";
import { ArrayReader } from "./util/array-reader";
import {
    CompoundNode,
    FunctionNode,
    isCompoundNode,
    isFunctionNode,
    isListNode,
    isRefNode,
    isRootNode,
    ListNode,
    NBTNode,
    RefNode,
    RootNode,
    ValueList
} from "./util/doc-walker-util";

export class NBTWalker {
    private readonly docfs: MemoryFS;
    private readonly parsed: NBTTag<any>;
    private readonly root: string;

    public constructor(
        parsed: NBTTag<any>,
        docfs: MemoryFS,
        root: string = "root.json"
    ) {
        this.parsed = parsed;
        this.docfs = docfs;
        this.root = root;
    }

    public getFinalNode(nbtpath: string[]): NBTNode | undefined {
        const rootNode = this.docfs.get<NBTNode>(this.root);
        const reader = new ArrayReader(nbtpath);
        return this.getNextNode(rootNode, reader, this.root);
    }

    private evalCompoundNode(
        node: CompoundNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const next = reader.read();
        if (next in node.children) {
            return this.getNextNode(node.children[next], reader, currentPath);
        } else if (node.child_ref) {
            for (const ref of node.child_ref) {
                const newPath = path.join(currentPath, ref);
                const cnode = this.nextNodeRef(
                    {
                        ref
                    },
                    currentPath
                );
                if (cnode === undefined) {
                    break;
                }
                if (isCompoundNode(cnode)) {
                    const outnode = this.evalCompoundNode(
                        cnode,
                        new ArrayReader([next]),
                        newPath
                    );
                    if (outnode) {
                        return outnode;
                    }
                }
            }
        }
        return undefined;
    }

    private evalFunctionNode(
        node: FunctionNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const refNode = this.functionNodeAsRef(node, reader.getRead());
        return this.evalRefNode(refNode, reader, currentPath);
    }

    private evalListNode(
        node: ListNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const next = reader.read();
        if (/\d+/.test(next)) {
            return this.getNextNode(node.item, reader, currentPath);
        }
        return undefined;
    }

    private evalRefNode(
        node: RefNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const newPath = path.join(currentPath, "..", node.ref);
        const newNode = this.nextNodeRef(node, currentPath);
        return this.getNextNode(newNode, reader, newPath);
    }

    private evalRootNode(
        node: RootNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const next = reader.read();
        if (next in node.children) {
            return this.getNextNode(node.children[next], reader, currentPath);
        } else {
            for (const key of Object.keys(node.children)) {
                if (key.startsWith("$")) {
                    const listName = key.substring(1);
                    const vals = this.docfs.get<ValueList>(
                        path.join(currentPath, listName)
                    );
                    if (vals.indexOf(next) >= 0) {
                        return this.getNextNode(
                            node.children[key],
                            reader,
                            currentPath
                        );
                    }
                }
            }
        }
        return undefined;
    }

    private functionNodeAsRef(node: FunctionNode, nbtPath: string[]): RefNode {
        return {
            description: node.description,
            ref: runNodeFunction(
                this.parsed,
                nbtPath,
                node,
                node.function.params
            ),
            suggestions: node.suggestions
        };
    }

    private getNextNode(
        node: NBTNode | undefined,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        if (reader.end() && node !== undefined) {
            if (isRefNode(node)) {
                return this.nextNodeRef(node, currentPath);
            } else if (isFunctionNode(node)) {
                return this.nextNodeRef(
                    this.functionNodeAsRef(node, reader.getRead()),
                    currentPath
                );
            } else {
                return node;
            }
        } else if (node === undefined) {
            return undefined;
        } else if (isRootNode(node)) {
            return this.evalRootNode(node, reader, currentPath);
        } else if (isCompoundNode(node)) {
            return this.evalCompoundNode(node, reader, currentPath);
        } else if (isListNode(node)) {
            return this.evalListNode(node, reader, currentPath);
        } else if (isRefNode(node)) {
            return this.evalRefNode(node, reader, currentPath);
        } else if (isFunctionNode(node)) {
            return this.evalFunctionNode(node, reader, currentPath);
        } else {
            return node;
        }
    }

    /*
    private getNextNodeChildRef(
        node: CompoundNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const next = reader.read();
        if (!node.child_ref) {
            return undefined;
        }
        for (const s of node.child_ref) {
            const childPath = path.join(currentPath, s);
            const refNode = this.getNextNodeRef(
                {
                    ref: childPath
                },
                new ArrayReader([]),
                currentPath
            );
            if (
                refNode !== undefined &&
                isCompoundNode(refNode) &&
                !!refNode.children &&
                next in refNode.children
            ) {
                return this.getNextNode(refNode, reader, childPath);
            }
        }
        return undefined;
    }
    */

    private nextNodeRef(
        node: RefNode,
        currentPath: string
    ): NBTNode | undefined {
        const refurl = url.parse(node.ref);
        const fragPath = (refurl.hash || "#")
            .substring(1)
            .split("/")
            .filter(v => v !== "");
        const fragReader = new ArrayReader(fragPath);
        const nextPath = path.join(currentPath, "..", node.ref);
        const newNode = this.docfs.get<NBTNode>(nextPath);
        return this.getNextNode(newNode, fragReader, nextPath);
    }
}
