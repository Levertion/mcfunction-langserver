import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import { ContextPath, resolvePaths } from "../../../misc-functions/context";
import { Parser, ReturnedInfo } from "../../../types";
import { MemoryFS } from "./doc-fs";
import { NBTWalker } from "./doc-walker";
import { NBTTagCompound } from "./tag/compound-tag";
import { addSuggestionsToHelper } from "./util/nbt-util";

type CtxPathFunc = (args: string[]) => NBTContextData;

interface NBTContextData {
    id?: string;
    type: "entity" | "item" | "block";
}

const paths: Array<ContextPath<CtxPathFunc>> = [
    {
        data: () => ({
            type: "entity"
        }),
        path: ["data", "merge", "entity", "target", "nbt"]
    }
];

export function parseNBT(
    reader: StringReader,
    docFS: MemoryFS,
    data?: NBTContextData
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper();
    const tag = new NBTTagCompound({});
    const reply = tag.parse(reader);

    if (helper.merge(reply)) {
        // Parsing is complete and nothing can be added
    } else {
        if (!!data) {
            const walker = new NBTWalker(
                reply.data.parsed || new NBTTagCompound({}),
                docFS
            );
            const node = walker.getFinalNode(
                [data.type, data.id || "none"].concat(reply.data.path || [])
            );
            if (!!node) {
                addSuggestionsToHelper(node, helper, reader);
            }
        }
    }
    return helper.hasErrors() ? helper.fail() : helper.succeed();
}

export const parser: Parser = {
    parse: (reader, prop) => {
        const ctxdatafn = resolvePaths(paths, prop.path || []);
        const data = !ctxdatafn ? undefined : ctxdatafn([]);
        return parseNBT(reader, prop.data.globalData.nbt_docs, data);
    }
};
