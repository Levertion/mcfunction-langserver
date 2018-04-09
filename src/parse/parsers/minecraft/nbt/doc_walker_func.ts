import path = require("path");
import { FunctionNode, getNBTTagFromTree } from "./doc_walker";
import { NBTTag } from "./tag/nbt_tag";

interface PathFunctions {
    [key: string]: PathFunc;
}

type PathFunc = (parsed: NBTTag<any>, nbtPath: string[], node: FunctionNode, args: any) => string;

export function runFunction(parsed: NBTTag<any>, nbtPath: string[], node: FunctionNode, args: any) {
    return pathsFuncs[node.function.id](parsed, nbtPath, node, args);
}

const pathsFuncs: PathFunctions = {
    insertStringNBT,
};

interface InsertStringNBTArgs {
    ref: string;
    default: string;
    tag_path: string;
}

// @ts-ignore
function insertStringNBT(parsed: NBTTagCompound, nbtPath: string[], node: FunctionNode, args: InsertStringNBTArgs) {
    const newRef = path.posix.resolve(nbtPath.join("/"), args.tag_path).split("/");
    const out = getNBTTagFromTree(parsed, newRef);
    return !out ? args.default : sprintf(args.ref, out.getStringValue());
}
