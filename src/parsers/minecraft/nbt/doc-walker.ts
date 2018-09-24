import { isString } from "util";
import { ReturnHelper } from "../../../misc-functions";
import { ReturnedInfo } from "../../../types";
import { MemoryFS } from "./doc-fs";
import { runNodeFunction } from "./doc-walker-func";
import { NBTTagCompound } from "./tag/compound-tag";
import { NBTTagList } from "./tag/list-tag";
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
    isTypedNode,
    ListNode,
    NBTNode,
    parseRefPath,
    RefNode,
    RootNode,
    VALIDATION_ERRORS,
    ValueList
} from "./util/doc-walker-util";

interface ContextData<
    N extends NBTNode = NBTNode,
    T extends NBTTag<any> = NBTTag<any>
> {
    allowRefWalk: boolean;
    finalValidation: boolean;
    node: N;
    path: string;
    reader: ArrayReader;
    tag?: T;
}

// tslint:disable:cyclomatic-complexity
export class NBTWalker {
    private readonly docfs: MemoryFS;
    private readonly extraChildren: boolean;
    private readonly nbtvld: boolean;
    private readonly parsed: NBTTag<any>;
    private readonly root: string;

    public constructor(
        parsed: NBTTag<any>,
        docfs: MemoryFS,
        extraChild: boolean,
        nbtvalidation: boolean = true,
        root: string = "root.json"
    ) {
        this.docfs = docfs;
        this.parsed = parsed;
        this.extraChildren = extraChild;
        this.root = root;
        this.nbtvld = nbtvalidation;
    }

    public getFinalNode(nbtpath: string[]): ReturnedInfo<NBTNode> {
        const node = this.docfs.get<NBTNode>(this.root);
        const reader = new ArrayReader(nbtpath);
        return this.getNextNode({
            allowRefWalk: false,
            finalValidation: true,
            node,
            path: this.root,
            reader,
            tag: this.nbtvld ? this.parsed : undefined
        });
    }

    private evalRef(
        ref: string,
        path: string,
        data: ContextData
    ): ReturnedInfo<NBTNode> {
        const [nextPath, fragPath] = parseRefPath(ref, path);
        const reader = new ArrayReader(fragPath);
        const node = this.docfs.get<NBTNode>(nextPath);
        return this.getNextNode({
            allowRefWalk: true,
            finalValidation: false,
            node,
            path: nextPath,
            reader,
            tag: data.tag
        });
    }

    private getNextNode(data: ContextData): ReturnedInfo<NBTNode> {
        const { reader, node, tag, allowRefWalk, finalValidation } = data;
        const helper = new ReturnHelper();
        if (reader.end()) {
            if (isRefNode(node)) {
                return this.walkRefNode(data as ContextData<RefNode>);
            } else if (isFunctionNode(node)) {
                return this.walkFunctionNode(data as ContextData<FunctionNode>);
            } else if (isCompoundNode(node)) {
                if (finalValidation && this.nbtvld && tag) {
                    const valres = tag.validationResponse(node, {
                        compoundMerge: () =>
                            this.mergeChildRef(data as ContextData<
                                CompoundNode,
                                NBTTagCompound
                            >),
                        extraChildren: this.extraChildren
                    });
                    if (!helper.merge(valres)) {
                        return helper.fail();
                    }
                }
                return helper.succeed(
                    this.mergeChildRef(data as ContextData<CompoundNode>)
                );
            } else {
                if (finalValidation && this.nbtvld && tag) {
                    const valres = tag.validationResponse(node);
                    if (!helper.merge(valres)) {
                        return helper.fail();
                    }
                }
                return helper.succeed(node);
            }
        } else if (
            allowRefWalk &&
            node.references &&
            reader.peek() in node.references
        ) {
            const next = reader.read();
            return this.getNextNode({
                ...data,
                node: node.references[next]
            });
        } else if (isTypedNode(node)) {
            if (isCompoundNode(node)) {
                if (this.nbtvld && tag) {
                    const valres = tag.validationResponse(node, {
                        compoundMerge: () =>
                            this.mergeChildRef(data as ContextData<
                                CompoundNode
                            >),
                        extraChildren: this.extraChildren
                    });
                    if (!helper.merge(valres)) {
                        return helper.fail();
                    }
                }
                if (tag && !(tag instanceof NBTTagCompound)) {
                    return helper.fail();
                }
                return this.walkCompoundNode(data as ContextData<
                    CompoundNode,
                    NBTTagCompound
                >);
            } else if (isListNode(node)) {
                if (this.nbtvld && tag) {
                    const valres = tag.validationResponse(node);
                    if (!helper.merge(valres)) {
                        return helper.fail();
                    }
                }
                if (tag && !(tag instanceof NBTTagList)) {
                    return helper.fail();
                }
                return this.walkListNode(data as ContextData<
                    ListNode,
                    NBTTagList
                >);
            } else if (isRootNode(node)) {
                return this.walkRootNode(data as ContextData<RootNode>);
            } else {
                if (tag) {
                    const valres = tag.validationResponse(node);
                    helper.merge(valres);
                }
                return helper.fail();
            }
        } else {
            if (isRefNode(node)) {
                return this.walkRefNode(data as ContextData<RefNode>);
            } else if (isFunctionNode(node)) {
                return this.walkFunctionNode(data as ContextData<FunctionNode>);
            }
        }
        return helper.fail();
    }

    private mergeChildRef(data: ContextData<CompoundNode>): CompoundNode {
        const { node, path: currentPath } = data;
        if (!node.child_ref) {
            return node;
        }
        const helper = new ReturnHelper();
        const newChildren = JSON.parse(
            JSON.stringify(node.children || {})
        ) as Exclude<CompoundNode["children"], undefined>;
        for (const ref of node.child_ref) {
            const [nextPath] = parseRefPath(ref, currentPath);
            const refNode = this.evalRef(ref, currentPath, data);
            if (!helper.merge(refNode)) {
                continue;
            } else if (isCompoundNode(refNode.data)) {
                const evalNode = this.mergeChildRef({
                    ...data,
                    node: refNode.data,
                    path: nextPath
                });
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

    private walkCompoundNode(
        data: ContextData<CompoundNode, NBTTagCompound>
    ): ReturnedInfo<NBTNode> {
        const { node, reader, path, tag } = data;
        const helper = new ReturnHelper();
        const next = reader.read();
        if (node.children && next in node.children) {
            /* 
             * It is safe to assume that next is in the tag
             * val because the path is based off of the tag
             */
            return this.getNextNode({
                ...data,
                node: node.children[next],
                tag: tag ? tag.getVal()[next] : undefined
            });
        } else if (node.child_ref) {
            for (const c of node.child_ref) {
                const [nextPath] = parseRefPath(c, path);
                const cnode = this.evalRef(c, path, data);
                if (
                    helper.merge(cnode) &&
                    isCompoundNode(cnode.data) &&
                    cnode.data.children &&
                    next in cnode.data.children
                ) {
                    return this.getNextNode({
                        ...data,
                        node: cnode.data.children[next],
                        path: nextPath,
                        tag: tag ? tag.getVal()[next] : undefined
                    });
                }
            }
        }
        return helper.fail();
    }

    private walkFunctionNode(
        data: ContextData<FunctionNode>
    ): ReturnedInfo<NBTNode> {
        const { node, reader, path } = data;
        const helper = new ReturnHelper();
        const ref = runNodeFunction(this.parsed, reader.getRead(), node);
        const [nextPath] = parseRefPath(ref, path);
        const newNode = this.evalRef(ref, path, data);
        if (!helper.merge(newNode)) {
            return helper.fail();
        }
        return this.getNextNode({
            ...data,
            node: newNode.data,
            path: nextPath
        });
    }

    private walkListNode(
        data: ContextData<ListNode, NBTTagList>
    ): ReturnedInfo<NBTNode> {
        const { node, reader, tag } = data;
        const next = reader.read();
        if (!/\d+/.test(next)) {
            return new ReturnHelper().fail(
                tag
                    ? VALIDATION_ERRORS.badIndex.create(
                          tag.getRange().start,
                          tag.getRange().end
                      )
                    : undefined
            );
        }
        const nextTag = tag
            ? tag.getVal()[Number.parseInt(next, 10)]
            : undefined;
        return this.getNextNode({
            ...data,
            node: node.item,
            tag: nextTag
        });
    }

    private walkRefNode(data: ContextData<RefNode>): ReturnedInfo<NBTNode> {
        const { node, path } = data;
        const helper = new ReturnHelper();
        const [nextPath] = parseRefPath(node.ref, path);
        const nnode = this.evalRef(node.ref, path, data);
        if (helper.merge(nnode)) {
            const out = this.getNextNode({
                ...data,
                node: nnode.data,
                path: nextPath
            });
            if (helper.merge(out)) {
                return helper.succeed(out.data);
            } else {
                return helper.fail();
            }
        } else {
            return helper.fail();
        }
    }

    private walkRootNode(data: ContextData<RootNode>): ReturnedInfo<NBTNode> {
        const { node, reader, path } = data;
        const next = reader.read();
        if (next in node.children) {
            return this.getNextNode({ ...data, node: node.children[next] });
        } else {
            for (const key of Object.keys(node.children)) {
                if (key.startsWith("$")) {
                    const ref = key.substring(1);
                    const [nextPath] = parseRefPath(ref, path);
                    const list = this.docfs.get<ValueList>(nextPath);
                    if (
                        list.find(
                            v => (isString(v) ? v === next : v.value === next)
                        )
                    ) {
                        return this.getNextNode({
                            ...data,
                            node: node.children[key]
                        });
                    }
                }
            }
        }
        return new ReturnHelper().fail();
    }
}
