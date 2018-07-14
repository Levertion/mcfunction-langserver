import * as path from "path";
import * as url from "url";
import { MemoryFS } from "./doc_fs";
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
    private readonly docfs: MemoryFS;
    private readonly parsed: NBTTag<any>;
    private readonly root: string;

    public constructor(
        parsed: NBTTag<any>,
        docfs: MemoryFS,
        root: string = rootNodePath
    ) {
        this.parsed = parsed;
        this.root = root;
        this.docfs = docfs;
    }

    public getFinalNode(nbtpath: string[]): NBTNode | undefined {
        const rootNode = this.docfs.get<NBTNode>(this.root);
        return this.getNextNode(
            rootNode,
            new ArrayReader(nbtpath),
            path.dirname(this.root)
        );
    }

    private getNextNode(
        node: NBTNode | undefined,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        if (reader.end() && node !== undefined) {
            if (isRefNode(node)) {
                return this.getNextNodeRef(node, reader, currentPath);
            } else if (isFunctionNode(node)) {
                return this.getNextNodeFunction(node, reader, currentPath);
            }
            return node;
        }
        if (node === undefined) {
            return undefined;
        }
        const next = reader.peek();
        if (isRefNode(node)) {
            return this.getNextNodeRef(node, reader, currentPath);
        } else if (isFunctionNode(node)) {
            return this.getNextNodeFunction(node, reader, currentPath);
        } else if (isCompoundNode(node)) {
            if (next in node.children) {
                reader.skip();
                return this.getNextNode(
                    node.children[next],
                    reader,
                    currentPath
                );
            } else {
                return this.getNextNodeChildRef(node, reader, currentPath);
            }
        } else if (isRootNode(node)) {
            if (next in node.children) {
                const nextNode = node.children[next];
                reader.skip();
                return this.getNextNode(nextNode, reader, currentPath);
            } else {
                for (const k of Object.keys(node.children)) {
                    if (k.startsWith("$")) {
                        const vals = this.docfs.get<ValueList>(
                            path.resolve(currentPath, k.slice(1))
                        );
                        if (vals.indexOf(next) !== -1) {
                            const nextNode = node.children[k];
                            return this.getNextNode(
                                nextNode,
                                reader,
                                currentPath
                            );
                        }
                    }
                }
            }
        } else if (isListNode(node)) {
            if (/\d+/.test(next)) {
                reader.skip();
                return node.item;
            }
        } else {
            return node;
        }
        return undefined;
    }

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
            const childPath = path.resolve(currentPath, s);
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
                !!refNode.child_ref &&
                next in refNode.child_ref
            ) {
                return this.getNextNode(refNode, reader, childPath);
            }
        }
        return undefined;
    }

    private getNextNodeFunction(
        node: FunctionNode,
        arr: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const newNode: RefNode = {
            ref: runNodeFunction(
                this.parsed,
                arr.getRead(),
                node,
                node.function.params
            )
        };
        return this.getNextNodeRef(newNode, arr, currentPath);
    }

    private getNextNodeRef(
        node: RefNode,
        reader: ArrayReader,
        currentPath: string
    ): NBTNode | undefined {
        const refUrl = url.parse(node.ref);
        const fragPath = (refUrl.hash || "#")
            .slice(1)
            .split("/")
            .filter(v => v !== "");
        const fragReader = new ArrayReader(fragPath);
        const nextPath = path.resolve(currentPath, node.ref);
        const newNode = this.docfs.get<NBTNode>(nextPath);
        const evalNode = this.getNextNode(newNode, fragReader, node.ref);
        return this.getNextNode(evalNode, reader, currentPath);
    }
}
