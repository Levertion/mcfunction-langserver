import { ok } from "assert";
import {
    CompoundNode,
    ListNode,
    NBTNode,
    RootNode,
    ValueList
} from "mc-nbt-paths";

import { NBTDocs } from "../../../data/types";

import { runNodeFunction } from "./doc-walker-func";
import { NBTTag } from "./tag/nbt-tag";
import { ArrayReader } from "./util/array-reader";
import {
    isCompoundInfo,
    isFunctionInfo,
    isListInfo,
    isRefInfo,
    isRootInfo,
    NodeInfo,
    parseRefPath
} from "./util/doc-walker-util";

function walkUnwrap(node: NBTNode | undefined): NBTNode;
function walkUnwrap(node: ValueList | undefined): ValueList;
function walkUnwrap<T extends NBTNode>(
    node: NodeInfo<T> | undefined
): NodeInfo<T>;
function walkUnwrap<T extends NBTNode>(
    node: ValueList | NBTNode | NodeInfo<T> | undefined
): ValueList | NBTNode | NodeInfo<T> {
    if (!node) {
        throw new Error(
            "Expected node to be defined, got undefined node. This is an internal error."
        );
    }
    return node;
}

export class NBTWalker {
    private static readonly root = "root.json";
    private readonly docs: NBTDocs;

    public constructor(docs: NBTDocs) {
        this.docs = docs;
    }

    public allowsUnknowns(info: NodeInfo<CompoundNode>): boolean | undefined {
        const { node } = info;
        if (node.additionalChildren !== undefined) {
            return node.additionalChildren;
        }
        if (node.child_ref) {
            for (const ref of node.child_ref) {
                const refInfo = walkUnwrap(this.resolveRef(ref, info.path));
                if (isCompoundInfo(refInfo)) {
                    const result = this.allowsUnknowns(refInfo);
                    if (result !== undefined) {
                        return result;
                    }
                }
            }
        }
        return undefined;
    }

    public followNodePath(
        info: NodeInfo | undefined,
        reader: ArrayReader,
        parsed?: NBTTag,
        useReferences?: boolean
    ): NodeInfo {
        if (!info) {
            return { path: "", node: { type: "no-nbt" } };
        }
        if (
            useReferences &&
            info.node.references &&
            reader.canRead() &&
            info.node.references.hasOwnProperty(reader.peek())
        ) {
            return this.followNodePath(
                {
                    node: info.node.references[reader.read()],
                    path: info.path
                },
                reader,
                parsed,
                useReferences
            );
        }
        if (isRefInfo(info)) {
            return this.followNodePath(
                this.resolveRef(info.node.ref, info.path),
                reader,
                parsed,
                useReferences
            );
        }
        if (isFunctionInfo(info)) {
            return this.followNodePath(
                this.resolveRef(
                    runNodeFunction(reader.getRead(), info.node, parsed),
                    info.path
                ),
                reader,
                parsed,
                useReferences
            );
        }
        if (!reader.canRead()) {
            return info;
        }
        if (isCompoundInfo(info)) {
            return this.followNodePath(
                this.getChildWithName(info, reader.read()),
                reader,
                parsed,
                useReferences
            );
        }
        if (isRootInfo(info)) {
            return this.followNodePath(
                this.getChildOfRoot(info, reader.read()),
                reader,
                parsed,
                useReferences
            );
        }
        if (isListInfo(info)) {
            ok(reader.peek().match(/\d+/));
            reader.read();
            return this.followNodePath(
                { node: info.node.item, path: info.path },
                reader,
                parsed,
                useReferences
            );
        }
        throw new Error(
            `Could not get next path after ${reader.peek()} in ${reader.getArray()} with info: ${JSON.stringify(
                info
            )}`
        );
    }

    public getChildOfRoot(
        info: NodeInfo<RootNode>,
        name: string
    ): NodeInfo | undefined {
        if (info.node.children.hasOwnProperty(name)) {
            return { ...info, node: info.node.children[name] };
        } else {
            for (const key of Object.keys(info.node.children)) {
                if (key.startsWith("$")) {
                    const ref = key.substring(1);
                    const [nextPath] = parseRefPath(ref, info.path);
                    const list = walkUnwrap(this.docs.get(
                        nextPath
                    ) as ValueList);
                    if (
                        list.find(v =>
                            typeof v === "string"
                                ? v === name
                                : v.value === name
                        )
                    ) {
                        return { ...info, node: info.node.children[key] };
                    }
                }
            }
        }
        return undefined;
    }

    public getChildren(
        info: NodeInfo<CompoundNode>
    ): { [key: string]: NodeInfo } {
        const { node } = info;
        const result: { [key: string]: NodeInfo } = {};
        if (node.child_ref) {
            for (const ref of node.child_ref.reverse()) {
                const refInfo = walkUnwrap(this.resolveRef(ref, info.path));
                if (isCompoundInfo(refInfo)) {
                    Object.assign(result, this.getChildren(refInfo));
                }
            }
        }
        if (node.children) {
            for (const key of Object.keys(node.children)) {
                result[key] = this.followNodePath(
                    { ...info, node: node.children[key] },
                    new ArrayReader([])
                );
            }
        }
        return result;
    }

    public getChildWithName(
        info: NodeInfo<CompoundNode>,
        name: string
    ): NodeInfo | undefined {
        const { node } = info;
        if (node.children && node.children.hasOwnProperty(name)) {
            return { ...info, node: node.children[name] };
        }
        if (node.child_ref) {
            for (const ref of node.child_ref) {
                const refInfo = walkUnwrap(this.resolveRef(ref, info.path));
                if (isCompoundInfo(refInfo)) {
                    const result = this.getChildWithName(refInfo, name);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return undefined;
    }

    /**
     * @param startPath A path which is known to be valid
     */
    public getInitialNode(startPath: string[]): NodeInfo {
        const path = NBTWalker.root;
        const node = walkUnwrap(this.docs.get(path) as NBTNode);
        const reader = new ArrayReader(startPath);
        return this.followNodePath({ node, path }, reader, undefined);
    }
    public getItem(info: NodeInfo<ListNode>): NodeInfo {
        return this.followNodePath(
            { ...info, node: info.node.item },
            new ArrayReader([])
        );
    }
    public resolveRef(refText: string, curPath: string): NodeInfo | undefined {
        const [path, fragPath] = parseRefPath(refText, curPath);
        const reader = new ArrayReader(fragPath);
        const node = this.docs.get(path);
        if (node) {
            return this.followNodePath(
                { node: node as NBTNode, path },
                reader,
                undefined,
                true
            );
        }
        return undefined;
    }
}
