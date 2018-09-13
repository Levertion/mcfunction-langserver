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
        return this.getNextNode(rootNode, reader, this.root, false);
    }

    private evalCompoundNode(
        node: CompoundNode,
        reader: ArrayReader,
        currentPath: string,
        allowReferences: boolean = false
    ): NBTNode | undefined {
        const next = reader.read();
        if (node.children && next in node.children) {
            return this.getNextNode(
                node.children[next],
                reader,
                currentPath,
                allowReferences
            );
        } else if (node.child_ref) {
            for (const ref of node.child_ref) {
                const [newPath] = parseRefPath(ref, currentPath);
                const cnode = this.nextNodeRef(ref, currentPath);
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
        currentPath: string,
        allowReferences: boolean
    ): NBTNode | undefined {
        const refNode = this.functionNodeAsRef(node, reader.getRead());
        return this.evalRefNode(refNode, reader, currentPath, allowReferences);
    }

    private evalListNode(
        node: ListNode,
        reader: ArrayReader,
        currentPath: string,
        allowReferences: boolean
    ): NBTNode | undefined {
        const next = reader.read();
        if (/\d+/.test(next)) {
            return this.getNextNode(
                node.item,
                reader,
                currentPath,
                allowReferences
            );
        }
        return undefined;
    }

    private evalRefNode(
        node: RefNode,
        reader: ArrayReader,
        currentPath: string,
        allowReferences: boolean
    ): NBTNode | undefined {
        const [newPath] = parseRefPath(node.ref, currentPath);
        const newNode = this.nextNodeRef(node.ref, currentPath);
        return this.getNextNode(newNode, reader, newPath, allowReferences);
    }

    private evalRootNode(
        node: RootNode,
        reader: ArrayReader,
        currentPath: string,
        allowReferences: boolean = false
    ): NBTNode | undefined {
        const next = reader.read();
        if (next in node.children) {
            return this.getNextNode(
                node.children[next],
                reader,
                currentPath,
                allowReferences
            );
        } else {
            for (const key of Object.keys(node.children)) {
                if (key.startsWith("$")) {
                    const listName = key.substring(1);
                    const vals = this.docfs.get<ValueList>(
                        parseRefPath(listName, currentPath)[0]
                    );
                    if (
                        vals.findIndex(v => {
                            if (typeof v === "string") {
                                return v === next;
                            } else {
                                return v.value === next;
                            }
                        }) >= 0
                    ) {
                        return this.getNextNode(
                            node.children[key],
                            reader,
                            currentPath,
                            allowReferences
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
        currentPath: string,
        allowReferences: boolean
    ): NBTNode | undefined {
        if (reader.end() && node !== undefined) {
            if (isRefNode(node)) {
                return this.nextNodeRef(node.ref, currentPath);
            } else if (isFunctionNode(node)) {
                return this.nextNodeRef(
                    this.functionNodeAsRef(node, reader.getRead()).ref,
                    currentPath
                );
            } else if (isCompoundNode(node) && node.child_ref) {
                return this.mergeChildRef(node, currentPath);
            } else {
                return node;
            }
        } else if (node === undefined) {
            return undefined;
        } else if (
            allowReferences &&
            node.references &&
            reader.peek() in node.references
        ) {
            const next = reader.read();
            return this.getNextNode(
                node.references[next],
                reader,
                currentPath,
                allowReferences
            );
        } else if (isRootNode(node)) {
            return this.evalRootNode(
                node,
                reader,
                currentPath,
                allowReferences
            );
        } else if (isCompoundNode(node)) {
            return this.evalCompoundNode(
                node,
                reader,
                currentPath,
                allowReferences
            );
        } else if (isListNode(node)) {
            return this.evalListNode(
                node,
                reader,
                currentPath,
                allowReferences
            );
        } else if (isRefNode(node)) {
            return this.evalRefNode(node, reader, currentPath, allowReferences);
        } else if (isFunctionNode(node)) {
            return this.evalFunctionNode(
                node,
                reader,
                currentPath,
                allowReferences
            );
        } else {
            return node;
        }
    }

    private mergeChildRef(
        node: CompoundNode,
        currentPath: string
    ): CompoundNode {
        if (!node.child_ref) {
            return node;
        }
        const newChildren = JSON.parse(
            JSON.stringify(node.children || {})
        ) as Exclude<CompoundNode["children"], undefined>;
        for (const ref of node.child_ref) {
            const refNode = this.nextNodeRef(ref, currentPath);
            if (!refNode) {
                continue;
            } else if (isCompoundNode(refNode)) {
                const evalNode = this.mergeChildRef(refNode, ref);
                if (evalNode.children) {
                    for (const child of Object.keys(evalNode.children)) {
                        newChildren[child] = evalNode.children[child];
                    }
                }
            }
        }
        return {
            children: newChildren,
            description: node.description,
            suggestions: node.suggestions,
            type: "compound"
        };
    }

    private nextNodeRef(ref: string, currentPath: string): NBTNode | undefined {
        const [nextPath, fragPath] = parseRefPath(ref, currentPath);
        const fragReader = new ArrayReader(fragPath);
        const newNode = this.docfs.get<NBTNode>(nextPath);
        return this.getNextNode(newNode, fragReader, nextPath, true);
    }
}

const parseRefPath = (ref: string, currentPath: string): [string, string[]] => {
    const cpd = path.dirname(currentPath);
    const refurl = url.parse(ref);
    const fragPath = (refurl.hash || "#")
        .substring(1)
        .split("/")
        .filter(v => v !== "");
    const nextPath = path.join(cpd, refurl.path || path.basename(currentPath));
    return [nextPath, fragPath];
};
