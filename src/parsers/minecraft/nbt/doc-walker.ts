import { MemoryFS } from "./doc-fs";
import { runNodeFunction } from "./doc-walker-func";
import { NBTTag } from "./tag/nbt-tag";
import { ArrayReader } from "./util/array-reader";
import {
    addFilePath,
    CompoundNode,
    FunctionNode,
    isCompoundNode,
    isFunctionNode,
    isListNode,
    isRefNode,
    isRootNode,
    ListNode,
    NBTNode,
    parseRefPath,
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
        const rootNode = this.getFsNode(this.root);
        const reader = new ArrayReader(nbtpath);
        const out = this.getNextNode(rootNode, reader, false);
        return out;
    }

    private evalCompoundNode(
        node: CompoundNode,
        reader: ArrayReader,
        allowReferences: boolean = false
    ): NBTNode | undefined {
        const next = reader.read();
        if (node.children && next in node.children) {
            return this.getNextNode(
                node.children[next],
                reader,
                allowReferences
            );
        } else if (node.child_ref) {
            for (const ref of node.child_ref) {
                const cnode = this.nextNodeRef(ref, node.filePath);
                if (cnode === undefined) {
                    break;
                }
                if (isCompoundNode(cnode)) {
                    const outnode = this.evalCompoundNode(
                        cnode,
                        new ArrayReader([next])
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
        allowReferences: boolean
    ): NBTNode | undefined {
        const refNode = this.functionNodeAsRef(node, reader.getRead());
        return this.evalRefNode(refNode, reader, allowReferences);
    }

    private evalListNode(
        node: ListNode,
        reader: ArrayReader,
        allowReferences: boolean
    ): NBTNode | undefined {
        const next = reader.read();
        if (/\d+/.test(next)) {
            return this.getNextNode(node.item, reader, allowReferences);
        }
        return undefined;
    }

    private evalRefNode(
        node: RefNode,
        reader: ArrayReader,
        allowReferences: boolean
    ): NBTNode | undefined {
        const newNode = this.nextNodeRef(node.ref, node.filePath);
        return this.getNextNode(newNode, reader, allowReferences);
    }

    private evalRootNode(
        node: RootNode,
        reader: ArrayReader,
        allowReferences: boolean = false
    ): NBTNode | undefined {
        const next = reader.read();
        if (next in node.children) {
            return this.getNextNode(
                node.children[next],
                reader,
                allowReferences
            );
        } else {
            for (const key of Object.keys(node.children)) {
                if (key.startsWith("$")) {
                    const listName = key.substring(1);
                    const vals = this.docfs.get<ValueList>(
                        parseRefPath(listName, node.filePath)[0]
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
            filePath: node.filePath,
            ref: runNodeFunction(
                this.parsed,
                nbtPath,
                node,
                node.function.params
            ),
            suggestions: node.suggestions
        };
    }

    private getFsNode(path: string): NBTNode {
        const out = this.docfs.get<NBTNode>(path);
        return addFilePath(out, path);
    }

    private getNextNode(
        node: NBTNode | undefined,
        reader: ArrayReader,
        allowReferences: boolean
    ): NBTNode | undefined {
        if (reader.end() && node !== undefined) {
            if (isRefNode(node)) {
                return this.nextNodeRef(node.ref, node.filePath);
            } else if (isFunctionNode(node)) {
                return this.nextNodeRef(
                    this.functionNodeAsRef(node, reader.getRead()).ref,
                    node.filePath
                );
            } else if (isCompoundNode(node) && node.child_ref) {
                return this.mergeChildRef(node);
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
                allowReferences
            );
        } else if (isRootNode(node)) {
            return this.evalRootNode(node, reader, allowReferences);
        } else if (isCompoundNode(node)) {
            return this.evalCompoundNode(node, reader, allowReferences);
        } else if (isListNode(node)) {
            return this.evalListNode(node, reader, allowReferences);
        } else if (isRefNode(node)) {
            return this.evalRefNode(node, reader, allowReferences);
        } else if (isFunctionNode(node)) {
            return this.evalFunctionNode(node, reader, allowReferences);
        } else {
            return node;
        }
    }

    private mergeChildRef(node: CompoundNode): CompoundNode {
        if (!node.child_ref) {
            return node;
        }
        const newChildren = JSON.parse(JSON.stringify(node.children || {})) as {
            [key: string]: NBTNode;
        };
        for (const ref of node.child_ref) {
            const refNode = this.nextNodeRef(ref, node.filePath);
            if (!refNode) {
                continue;
            } else if (isCompoundNode(refNode)) {
                const evalNode = this.mergeChildRef(refNode);
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
            filePath: node.filePath,
            suggestions: node.suggestions,
            type: "compound"
        };
    }

    private nextNodeRef(ref: string, currentPath: string): NBTNode | undefined {
        const [nextPath, fragPath] = parseRefPath(ref, currentPath);
        const fragReader = new ArrayReader(fragPath);
        const newNode = this.getFsNode(nextPath);
        return this.getNextNode(newNode, fragReader, true);
    }
}
