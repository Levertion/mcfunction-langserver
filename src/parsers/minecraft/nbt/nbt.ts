import { isArray } from "util";
import { StringReader } from "../../../brigadier/string-reader";
import { isSuccessful, ReturnHelper } from "../../../misc-functions";
import { ContextPath, resolvePaths } from "../../../misc-functions/context";
import { Parser, ParserInfo, ReturnedInfo } from "../../../types";
import { NBTWalker } from "./doc-walker";
import { NBTTagCompound } from "./tag/compound-tag";

type CtxPathFunc = (args: string[]) => NBTContextData;

export interface NBTContextData {
    id?: string | string[];
    type: "entity" | "item" | "block";
}

const paths: Array<ContextPath<CtxPathFunc>> = [
    {
        data: () => ({
            type: "entity"
        }),
        path: ["data", "merge", "entity", "target", "nbt"]
    },
    {
        data: () => ({
            type: "block"
        }),
        path: ["data", "merge", "block", "pos", "nbt"]
    },
    {
        data: args => ({
            id: args[1],
            type: "entity"
        }),
        path: ["summon", "entity", "pos", "nbt"]
    }
];

export function parseNBT(
    reader: StringReader,
    info: ParserInfo,
    data?: NBTContextData
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper();
    const tag = new NBTTagCompound({});
    const docs = info.data.globalData.nbt_docs;
    const reply = tag.parse(reader);

    if (helper.merge(reply)) {
        return helper.succeed();
    } else {
        if (!!data) {
            const walker = new NBTWalker(
                reply.data.parsed || new NBTTagCompound({}),
                docs,
                data.type === "item"
            );
            if (isArray(data.id)) {
                for (const k of data.id) {
                    const node = walker.getFinalNode([
                        data.type,
                        k,
                        ...(reply.data.path || [])
                    ]);
                    if (isSuccessful(node)) {
                        helper.mergeChain(node);
                    } else {
                        helper.mergeChain(node, false);
                    }
                }
                return helper.fail();
            } else {
                const node = walker.getFinalNode([
                    data.type,
                    data.id || "none",
                    ...(reply.data.path || [])
                ]);
                return helper.mergeChain(node).fail();
            }
        } else {
            return helper.fail();
        }
    }
}

export const parser: Parser = {
    parse: (reader, prop) => {
        const helper = new ReturnHelper(prop);
        const ctxdatafn = resolvePaths(paths, prop.path || []);
        const data = !ctxdatafn ? undefined : ctxdatafn([]);
        if (helper.merge(parseNBT(reader, prop, data))) {
            return helper.succeed();
        } else {
            return helper.fail();
        }
    }
};
