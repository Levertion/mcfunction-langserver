import path = require("path");
import { sprintf } from "sprintf-js";
import { FunctionNode, getNBTTagFromTree } from "./doc_walker_util";
import { NBTTag } from "./tag/nbt_tag";
import { NBTTagString } from "./tag/string_tag";

interface PathFunctions {
    [key: string]: PathFunc;
}

interface SuggestFuncs {
    [key: string]: SuggestFunc;
}

type PathFunc = (
    parsed: NBTTag<any>,
    nbtPath: string[],
    node: FunctionNode,
    args: any
) => string;
type SuggestFunc = (func: string, args: any) => string[];

export function runNodeFunction(
    parsed: NBTTag<any>,
    nbtPath: string[],
    node: FunctionNode,
    args: any
) {
    return pathsFuncs[node.function.id](parsed, nbtPath, node, args);
}

const pathsFuncs: PathFunctions = {
    insertStringNBT
};

const suggestFuncs: SuggestFuncs = {};

interface InsertStringNBTArgs {
    ref: string;
    default: string;
    tag_path: string;
}

// @ts-ignore
function insertStringNBT(
    parsed: NBTTagCompound,
    nbtPath: string[],
    node: FunctionNode,
    args: InsertStringNBTArgs
) {
    const newRef = path.posix
        .join(path.dirname(nbtPath.join("/")), args.tag_path)
        .split("/");
    const out = getNBTTagFromTree(parsed, newRef);
    return !out || !(out instanceof NBTTagString)
        ? args.default
        : sprintf(args.ref, out.getVal());
}

// Suggest function

export function runSuggestFunction(func: string, args: any) {
    return suggestFuncs[func](func, args);
}
