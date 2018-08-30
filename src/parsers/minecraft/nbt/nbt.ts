import { isArray } from "util";
import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import { ContextPath, resolvePaths } from "../../../misc-functions/context";
import { Parser, ParserInfo, ReturnedInfo } from "../../../types";
import { NBTWalker } from "./doc-walker";
import { NBTTagCompound } from "./tag/compound-tag";
import { addSuggestionsToHelper } from "./util/nbt-util";

type CtxPathFunc = (args: string[]) => NBTContextData;

interface NBTContextData {
    id?: string | string[];
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
    info: ParserInfo,
    data?: NBTContextData
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper(info);
    const tag = new NBTTagCompound({});
    const reply = tag.parse(reader);
    const docFS = info.data.globalData.nbt_docs;

    if (helper.merge(reply)) {
        return helper.succeed();
    }
    if (!!data) {
        const walker = new NBTWalker(
            reply.data.parsed || new NBTTagCompound({}),
            docFS
        );
        if (isArray(data.id)) {
            for (const id of data.id) {
                const node = walker.getFinalNode(
                    [data.type, id || "none"].concat(reply.data.path || [])
                );
                if (!!node) {
                    addSuggestionsToHelper(node, helper, reader);
                }
            }
        } else {
            const node = walker.getFinalNode(
                [data.type, data.id || "none"].concat(reply.data.path || [])
            );
            if (!!node) {
                addSuggestionsToHelper(node, helper, reader);
            }
        }
    }
    return helper.fail();
}

export const parser: Parser = {
    parse: (reader, prop) => {
        const ctxdatafn = resolvePaths(paths, prop.path || []);
        const data = !ctxdatafn ? undefined : ctxdatafn([]);
        return parseNBT(reader, prop, data);
    }
};
