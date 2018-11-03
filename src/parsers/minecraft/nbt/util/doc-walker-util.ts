import {
    CompoundNode,
    FunctionNode,
    ListNode,
    NBTNode,
    NoPropertyNode,
    RefNode,
    RootNode
} from "mc-nbt-paths";
import * as path from "path";

import * as url from "url";
import { DiagnosticSeverity } from "vscode-languageserver/lib/main";
import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { NBTTagCompound } from "../tag/compound-tag";
import { BaseList } from "../tag/lists";
import { NBTTag } from "../tag/nbt-tag";

export const parseRefPath = (
    ref: string,
    currentPath: string
): [string, string[]] => {
    const cpd = path.dirname(currentPath);
    const refurl = url.parse(ref);
    const fragPath = (refurl.hash || "#")
        .substring(1)
        .split("/")
        .filter(v => v !== "");
    const nextPath = path.posix.join(
        cpd,
        refurl.path || path.basename(currentPath)
    );
    return [nextPath, fragPath];
};

export function getNBTTagFromTree(
    tag: NBTTag,
    nbtPath: string[]
): NBTTag | undefined {
    let lastTag: NBTTag | undefined = tag;
    for (const s of nbtPath) {
        // tslint:disable:no-require-imports This fixes a circular dependency issue
        if (
            lastTag instanceof require("../tag/lists").BaseList &&
            /\d+/.test(s)
        ) {
            lastTag = (lastTag as BaseList).getValue()[parseInt(s, 10)];
        } else if (lastTag instanceof require("../tag/compound-tag").BaseList) {
            lastTag = (lastTag as NBTTagCompound).getValue().get(s);
        } else {
            return undefined;
        }
        // tslint:enable:no-require-imports
    }
    return lastTag;
}

/**
 * type parameter N is used to allow passing nodes whose type have already been determined
 */
export interface NodeInfo<N extends NBTNode = NBTNode> {
    readonly node: N;
    readonly path: string;
}

export function isRefNode(node: NBTNode): node is RefNode {
    return node.hasOwnProperty("ref");
}

export function isFunctionNode(node: NBTNode): node is FunctionNode {
    return node.hasOwnProperty("function");
}

export type TypedNode = NoPropertyNode | CompoundNode | ListNode | RootNode;
export function isTypedNode(node: NBTNode): node is TypedNode {
    return node.hasOwnProperty("type");
}

export function isCompoundNode(node: NBTNode): node is CompoundNode {
    return isTypedNode(node) && node.type === "compound";
}

export function isRootNode(node: NBTNode): node is RootNode {
    return isTypedNode(node) && node.type === "root";
}

export function isListNode(node: NBTNode): node is ListNode {
    return isTypedNode(node) && node.type === "list";
}

// Return type is a lie to allow using the convert function below
export function isNoNBTNode(node: NBTNode): node is NoPropertyNode {
    return isTypedNode(node) && node.type === "no-nbt";
}

export const isRefInfo = convert(isRefNode);
export const isFunctionInfo = convert(isFunctionNode);
export const isTypedInfo = convert(isTypedNode);
export const isCompoundInfo = convert(isCompoundNode);
export const isRootInfo = convert(isRootNode);
export const isListInfo = convert(isListNode);
export const isNoNBTInfo = convert(isNoNBTNode);

function convert<T extends NBTNode>(
    f: (node: NBTNode) => node is T
): (info: NodeInfo<any>) => info is NodeInfo<T> {
    return (info): info is NodeInfo<T> => f(info.node);
}

export interface NBTValidationInfo {
    endPos: number;
    extraChildren: boolean;
    compoundMerge(): CompoundNode; // This is so the compound parser can merge child ref on call
}

export const VALIDATION_ERRORS = {
    badIndex: new CommandErrorBuilder(
        "argument.nbt.validation.list.badpath",
        "The index '%s' is not a valid index"
    ),
    noSuchChild: new CommandErrorBuilder(
        "argument.nbt.validation.compound.nochild",
        "The tag does not have a child named '%s'",
        DiagnosticSeverity.Warning
    ),
    wrongType: new CommandErrorBuilder(
        "argument.nbt.validation.wrongtype",
        "Expected nbt value to be %s, got %s"
    )
};
