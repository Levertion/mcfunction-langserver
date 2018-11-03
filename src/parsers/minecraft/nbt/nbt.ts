import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import {
    ContextPath,
    resolvePaths,
    stringArrayEqual
} from "../../../misc-functions/context";
import {
    CommandContext,
    Parser,
    ParserInfo,
    ReturnedInfo
} from "../../../types";
import { NBTTagCompound, UnknownsError } from "./tag/compound-tag";
import { isNoNBTInfo } from "./util/doc-walker-util";
import { Correctness } from "./util/nbt-util";
import { NBTWalker } from "./walker";

type CtxPathFunc = (context: CommandContext) => NBTContextData;

export interface NBTContextData {
    ids?: string | string[];
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
            ids: args.entity,
            type: "entity"
        }),
        path: ["summon", "entity", "pos", "nbt"]
    }
];

export function validateParse(
    reader: StringReader,
    info: ParserInfo,
    data?: NBTContextData
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper();
    const tag = new NBTTagCompound([]);
    const docs = info.data.globalData.nbt_docs;
    const parseResult = tag.parse(reader);
    if (helper.merge(parseResult) || parseResult.data > Correctness.NO) {
        if (!!data) {
            const walker = new NBTWalker(docs);
            const addUnknownError = (error: UnknownsError, id?: string) => {
                const { path, ...allowed } = error;
                helper.addErrors({
                    ...allowed,
                    // This will break when translations are added, not sure how best to do this
                    text: id
                        ? `${error.text} for ${data.type} ${id}`
                        : error.text
                });
            };
            if (Array.isArray(data.ids)) {
                for (const id of data.ids) {
                    const root = walker.getInitialNode([data.type, id]);
                    if (!isNoNBTInfo(root)) {
                        const result = tag.validate(root, walker);
                        helper.merge(result, { errors: false });
                        for (const e of result.errors) {
                            const error = e as UnknownsError;
                            if (error.path) {
                                if (
                                    !helper
                                        .getShared()
                                        .errors.find(v =>
                                            stringArrayEqual(
                                                (v as UnknownsError).path,
                                                error.path
                                            )
                                        )
                                ) {
                                    addUnknownError(error, id);
                                }
                            } else {
                                helper.addErrors(error);
                            }
                        }
                    }
                }
            } else {
                const root = walker.getInitialNode([
                    data.type,
                    data.ids || "none"
                ]);
                if (!isNoNBTInfo(root)) {
                    const result = tag.validate(root, walker);
                    helper.merge(result, { errors: false });
                    for (const e of result.errors) {
                        const error = e as UnknownsError;
                        if (error.path) {
                            addUnknownError(error);
                        } else {
                            helper.addErrors(error);
                        }
                    }
                }
            }
        }
        return helper.succeed();
    } else {
        return helper.fail();
    }
}

export const parser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const ctxdatafn = resolvePaths(paths, info.path || []);
        const data = ctxdatafn && ctxdatafn(info.context);
        return helper.return(validateParse(reader, info, data));
    }
};
