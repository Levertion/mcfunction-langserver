import { ok } from "assert";
import {
    CompoundNode,
    ListNode,
    NBTNode,
    RootNode,
    ValueList
} from "mc-nbt-paths";
import { isString } from "util";
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
                        list.find(
                            v => (isString(v) ? v === name : v.value === name)
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

// Old version
// #interface ContextData<
// #    N extends NBTNode = NBTNode,
// #    T extends NBTTag<any> = NBTTag<any>
// #> {
// #    readonly finalValidation: boolean;
// #    readonly node: N;
// #    readonly path: string;
// #    readonly reader: ArrayReader;
// #    readonly tag?: T;
// #    readonly useReferences: boolean;
// #}
// #
// #// tslint:disable:cyclomatic-complexity
// #// tslint:disable-next-line:max-classes-per-file
// #export class NBTValidator {
// #    private readonly docs: NBTDocs;
// #    private readonly extraChildren: boolean;
// #    private readonly parsed: NBTTag<any>;
// #    private readonly root: string;
// #    private readonly validateNBT: boolean;
// #
// #    public constructor(
// #        parsed: NBTTag<any>,
// #        docs: NBTDocs,
// #        extraChild: boolean,
// #        nbtvalidation: boolean = true,
// #        root: string = "root.json"
// #    ) {
// #        this.docs = docs;
// #        this.parsed = parsed;
// #        this.extraChildren = extraChild;
// #        this.root = root;
// #        this.validateNBT = nbtvalidation;
// #    }
// #
// #    public walkThenValidate(nbtpath: string[]): ReturnedInfo<NBTNode> {
// #        const node = this.docs.get(this.root) as RootNode;
// #        const reader = new ArrayReader(nbtpath);
// #        // tslint:disable-next-line:helper-return
// #        return this.walkNextNode({
// #            finalValidation: true,
// #            node,
// #            path: this.root,
// #            reader,
// #            tag: this.validateNBT ? this.parsed : undefined,
// #            useReferences: false
// #        });
// #    }
// #
// #    private mergeChildRef(data: ContextData<CompoundNode>): CompoundNode {
// #        const { node, path: currentPath } = data;
// #        if (!node.child_ref) {
// #            return node;
// #        }
// #        const helper = new ReturnHelper();
// #        const newChildren = JSON.parse(
// #            JSON.stringify(node.children || {})
// #        ) as Exclude<CompoundNode["children"], undefined>;
// #        for (const ref of node.child_ref) {
// #            const [nextPath] = parseRefPath(ref, currentPath);
// #            const refNode = this.walkRef(ref, currentPath, data);
// #            if (!helper.merge(refNode)) {
// #                continue;
// #            } else if (isCompoundNode(refNode.data)) {
// #                const evalNode = this.mergeChildRef({
// #                    ...data,
// #                    node: refNode.data,
// #                    path: nextPath
// #                });
// #                if (evalNode.children) {
// #                    for (const child of Object.keys(evalNode.children)) {
// #                        newChildren[child] = evalNode.children[child];
// #                    }
// #                }
// #            }
// #        }
// #        return {
// #            children: newChildren,
// #            description: node.description,
// #            suggestions: node.suggestions,
// #            type: "compound"
// #        };
// #    }
// #
// #    private walkCompoundNode(
// #        data: ContextData<CompoundNode, NBTTagCompound>
// #    ): ReturnedInfo<NBTNode> {
// #        const { node, reader, path, tag } = data;
// #        const helper = new ReturnHelper();
// #        const next = reader.read();
// #        if (node.children && next in node.children) {
// #            /*
// #             * It is safe to assume that next is in the tag
// #             * val because the path is based off of the tag
// #             */
// #            return helper.return(
// #                this.walkNextNode({
// #                    ...data,
// #                    node: node.children[next],
// #                    tag: tag ? tag.getVal()[next] : undefined
// #                })
// #            );
// #        } else if (node.child_ref) {
// #            for (const c of node.child_ref) {
// #                const [nextPath] = parseRefPath(c, path);
// #                const cnode = this.walkRef(c, path, data);
// #                if (
// #                    helper.merge(cnode) &&
// #                    isCompoundNode(cnode.data) &&
// #                    cnode.data.children &&
// #                    next in cnode.data.children
// #                ) {
// #                    return helper.return(
// #                        this.walkNextNode({
// #                            ...data,
// #                            node: cnode.data.children[next],
// #                            path: nextPath,
// #                            tag: tag ? tag.getVal()[next] : undefined
// #                        })
// #                    );
// #                }
// #            }
// #        }
// #        return helper.fail();
// #    }
// #
// #    private walkFunctionNode(
// #        data: ContextData<FunctionNode>
// #    ): ReturnedInfo<NBTNode> {
// #        const { node, reader, path } = data;
// #        const helper = new ReturnHelper();
// #        const ref = runNodeFunction(this.parsed, reader.getRead(), node);
// #        const [nextPath] = parseRefPath(ref, path);
// #        const newNode = this.walkRef(ref, path, data);
// #        if (!helper.merge(newNode)) {
// #            return helper.fail();
// #        }
// #        return helper.return(
// #            this.walkNextNode({
// #                ...data,
// #                node: newNode.data,
// #                path: nextPath
// #            })
// #        );
// #    }
// #
// #    private walkListNode(
// #        data: ContextData<ListNode, NBTTagList>
// #    ): ReturnedInfo<NBTNode> {
// #        const { node, reader, tag } = data;
// #        const next = reader.read();
// #        const helper = new ReturnHelper();
// #        if (!/\d+/.test(next)) {
// #            return helper.fail(
// #                tag
// #                    ? VALIDATION_ERRORS.badIndex.create(
// #                          tag.getRange().start,
// #                          tag.getRange().end
// #                      )
// #                    : undefined
// #            );
// #        }
// #        const nextTag = tag
// #            ? tag.getVal()[Number.parseInt(next, 10)]
// #            : undefined;
// #        return helper.return(
// #            this.walkNextNode({
// #                ...data,
// #                node: node.item,
// #                tag: nextTag
// #            })
// #        );
// #    }
// #
// #    private walkNextNode(data: ContextData): ReturnedInfo<NBTNode> {
// #        const { reader, node, tag, useReferences, finalValidation } = data;
// #        const helper = new ReturnHelper();
// #        if (reader.onLast()) {
// #            if (isRefNode(node)) {
// #                return helper.return(
// #                    this.walkRefNode(data as ContextData<RefNode>)
// #                );
// #            } else if (isFunctionNode(node)) {
// #                return helper.return(
// #                    this.walkFunctionNode(data as ContextData<FunctionNode>)
// #                );
// #            } else if (isCompoundNode(node)) {
// #                if (finalValidation && this.validateNBT && tag) {
// #                    const valres = tag.valideAgainst(node, {
// #                        compoundMerge: () =>
// #                            this.mergeChildRef(data as ContextData<
// #                                CompoundNode,
// #                                NBTTagCompound
// #                            >),
// #                        extraChildren: this.extraChildren
// #                    });
// #                    if (!helper.merge(valres)) {
// #                        return helper.fail();
// #                    }
// #                }
// #                return helper.succeed(
// #                    finalValidation
// #                        ? this.mergeChildRef(data as ContextData<CompoundNode>)
// #                        : node
// #                );
// #            } else {
// #                if (finalValidation && this.validateNBT && tag) {
// #                    const valres = tag.valideAgainst(node);
// #                    if (!helper.merge(valres)) {
// #                        return helper.fail();
// #                    }
// #                }
// #                return helper.succeed(node);
// #            }
// #        } else if (
// #            useReferences &&
// #            node.references &&
// #            reader.peek() in node.references
// #        ) {
// #            const next = reader.read();
// #            return helper.return(
// #                this.walkNextNode({
// #                    ...data,
// #                    node: node.references[next]
// #                })
// #            );
// #        } else if (isTypedNode(node)) {
// #            if (isCompoundNode(node)) {
// #                if (this.validateNBT && tag) {
// #                    const valres = tag.valideAgainst(node, {
// #                        compoundMerge: () =>
// #                            this.mergeChildRef(data as ContextData<
// #                                CompoundNode
// #                            >),
// #                        extraChildren: this.extraChildren
// #                    });
// #                    if (!helper.merge(valres)) {
// #                        return helper.fail();
// #                    }
// #                }
// #                if (tag && !(tag instanceof NBTTagCompound)) {
// #                    return helper.fail();
// #                }
// #                return helper.return(
// #                    this.walkCompoundNode(data as ContextData<
// #                        CompoundNode,
// #                        NBTTagCompound
// #                    >)
// #                );
// #            } else if (isListNode(node)) {
// #                if (this.validateNBT && tag) {
// #                    const valres = tag.valideAgainst(node);
// #                    if (!helper.merge(valres)) {
// #                        return helper.fail();
// #                    }
// #                }
// #                if (tag && !(tag instanceof NBTTagList)) {
// #                    return helper.fail();
// #                }
// #                return helper.return(
// #                    this.walkListNode(data as ContextData<ListNode, NBTTagList>)
// #                );
// #            } else if (isRootNode(node)) {
// #                return helper.return(
// #                    this.walkRootNode(data as ContextData<RootNode>)
// #                );
// #            } else {
// #                if (tag) {
// #                    const valres = tag.valideAgainst(node);
// #                    helper.merge(valres);
// #                }
// #                return helper.fail();
// #            }
// #        } else {
// #            if (isRefNode(node)) {
// #                return helper.return(
// #                    this.walkRefNode(data as ContextData<RefNode>)
// #                );
// #            } else if (isFunctionNode(node)) {
// #                return helper.return(
// #                    this.walkFunctionNode(data as ContextData<FunctionNode>)
// #                );
// #            }
// #        }
// #        return helper.fail();
// #    }
// #
// #    private walkRef(
// #        ref: string,
// #        path: string,
// #        data: ContextData
// #    ): ReturnedInfo<NBTNode> {
// #        const [nextPath, fragPath] = parseRefPath(ref, path);
// #        const reader = new ArrayReader(fragPath);
// #        const node = this.docs.get(nextPath) as NBTNode;
// #        // tslint:disable-next-line:helper-return
// #        return this.walkNextNode({
// #            useReferences: true,
// #            finalValidation: false,
// #            node,
// #            path: nextPath,
// #            reader,
// #            tag: data.tag
// #        });
// #    }
// #
// #    private walkRefNode(data: ContextData<RefNode>): ReturnedInfo<NBTNode> {
// #        const { node, path } = data;
// #        const helper = new ReturnHelper();
// #        const [nextPath] = parseRefPath(node.ref, path);
// #        const nnode = this.walkRef(node.ref, path, data);
// #        if (helper.merge(nnode)) {
// #            const out = this.walkNextNode({
// #                ...data,
// #                node: nnode.data,
// #                path: nextPath
// #            });
// #            if (helper.merge(out)) {
// #                return helper.succeed(out.data);
// #            } else {
// #                return helper.fail();
// #            }
// #        } else {
// #            return helper.fail();
// #        }
// #    }
// #
// #    private walkRootNode(data: ContextData<RootNode>): ReturnedInfo<NBTNode> {
// #        const { node, reader, path } = data;
// #        const next = reader.read();
// #        const helper = new ReturnHelper();
// #        if (next in node.children) {
// #            return helper.return(
// #                this.walkNextNode({
// #                    ...data,
// #                    node: node.children[next]
// #                })
// #            );
// #        } else {
// #            for (const key of Object.keys(node.children)) {
// #                if (key.startsWith("$")) {
// #                    const ref = key.substring(1);
// #                    const [nextPath] = parseRefPath(ref, path);
// #                    const list = (this.docs.get(nextPath) as any) as ValueList;
// #                    if (
// #                        list.find(
// #                            v => (isString(v) ? v === next : v.value === next)
// #                        )
// #                    ) {
// #                        return helper.return(
// #                            this.walkNextNode({
// #                                ...data,
// #                                node: node.children[key]
// #                            })
// #                        );
// #                    }
// #                }
// #            }
// #        }
// #        return helper.fail();
// #    }
// #}
// #
