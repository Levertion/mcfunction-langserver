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
import { NBTTagList } from "../tag/list-tag";
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
    tag: NBTTag<any>,
    nbtPath: string[]
): NBTTag<any> | undefined {
    let lastTag = tag;
    for (const s of nbtPath) {
        if (lastTag.tagType === "list" && /\d+/.test(s)) {
            lastTag = (tag as NBTTagList).getVal()[parseInt(s, 10)];
        } else if (lastTag.tagType === "compound") {
            lastTag = (tag as NBTTagCompound).getVal()[s];
        } else {
            return undefined;
        }
    }
    return lastTag;
}

export function isRefNode(node: NBTNode): node is RefNode {
    return "ref" in node;
}

export function isFunctionNode(node: NBTNode): node is FunctionNode {
    return "function" in node;
}

export function isTypedNode(
    node: NBTNode
): node is NoPropertyNode | CompoundNode | ListNode | RootNode {
    return "type" in node;
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

export interface NBTValidationInfo {
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
        "The tag type '%s' is not the correct type '%s'"
    )
};
