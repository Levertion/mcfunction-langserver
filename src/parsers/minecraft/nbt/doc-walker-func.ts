import { FunctionNode } from "mc-nbt-paths";
import * as path from "path";
import { sprintf } from "sprintf-js";
import { NBTTag } from "./tag/nbt-tag";
import { NBTTagString } from "./tag/string-tag";
import { getNBTTagFromTree } from "./util/doc-walker-util";

interface PathFunctions {
    [key: string]: PathFunc;
}

interface SuggestFuncs {
    [key: string]: SuggestFunc;
}

type PathFunc = (
    parsed: NBTTag<any> | undefined,
    nbtPath: string[],
    node: FunctionNode,
    args: any
) => string;
type SuggestFunc = (func: string, args: any) => string[];

const pathsFuncs: PathFunctions = {
    insertStringNBT
};

export function runNodeFunction(
    nbtPath: string[],
    node: FunctionNode,
    parsed: NBTTag<any> | undefined
): string {
    return pathsFuncs[node.function.id](
        parsed,
        nbtPath,
        node,
        node.function.params
    );
}

const suggestFuncs: SuggestFuncs = {};

interface InsertStringNBTArgs {
    default: string;
    ref: string;
    tag_path: string;
}

function insertStringNBT(
    parsed: NBTTag<any> | undefined,
    nbtPath: string[],
    _: FunctionNode,
    args: InsertStringNBTArgs
): string {
    // Not sure what this is doing
    if (!parsed) {
        return args.default;
    }
    const newRef = path.posix
        .join(path.dirname(nbtPath.join("/")), args.tag_path)
        .split("/");
    const out = getNBTTagFromTree(parsed, newRef);
    return !out || !(out instanceof NBTTagString)
        ? args.default
        : sprintf(args.ref, out.getVal());
}

// Suggest function

export function runSuggestFunction(func: string, args: any): string[] {
    return suggestFuncs[func](func, args);
}
