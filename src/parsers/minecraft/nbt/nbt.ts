import { CommandError } from "../../../brigadier/errors";
import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import { ContextPath, startPaths } from "../../../misc-functions/context";
import {
    CommandContext,
    Parser,
    ParserInfo,
    ReturnedInfo,
    ReturnSuccess
} from "../../../types";
import { parseAnyNBTTag } from "./tag-parser";
import { UnknownsError } from "./tag/compound-tag";
import { isNoNBTInfo, NodeInfo } from "./util/doc-walker-util";
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
        path: ["data", "merge", "entity"]
    },
    {
        data: () => ({
            type: "block"
        }),
        path: ["data", "merge", "block"]
    },
    {
        data: args => ({
            ids: args.otherEntity,
            type: "entity"
        }),
        path: ["summon", "entity"]
    }
    // TODO - handle nbt_tag in /data modify
];

export function validateParse(
    reader: StringReader,
    info: ParserInfo,
    data?: NBTContextData
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper();
    const docs = info.data.globalData.nbt_docs;
    const parseResult = parseAnyNBTTag(reader, []);
    const datum = parseResult.data;
    if (
        datum && // This is to appease the type checker
        (helper.merge(parseResult) || datum.correctness > Correctness.NO)
    ) {
        if (!!data) {
            const walker = new NBTWalker(docs);
            const unknowns = new Set<string>();
            if (Array.isArray(data.ids)) {
                for (const id of data.ids) {
                    const root = walker.getInitialNode([data.type, id]);
                    if (!isNoNBTInfo(root)) {
                        const result = datum.tag.validate(root, walker);
                        helper.merge(result, { errors: false });
                        helper.merge(
                            solveUnkownErrors(
                                result.errors,
                                unknowns,
                                `${data.type} '${id}'`
                            )
                        );
                    }
                }
            } else {
                const root = walker.getInitialNode([
                    data.type,
                    data.ids || "none"
                ]);
                if (!isNoNBTInfo(root)) {
                    const result = datum.tag.validate(root, walker);
                    helper.merge(result, { errors: false });
                    helper.merge(
                        solveUnkownErrors(
                            result.errors,
                            unknowns,
                            `${data.type} '${data.ids || "unspecified"}'`
                        )
                    );
                }
            }
        }
        return helper.succeed();
    } else {
        return helper.fail();
    }
}

function solveUnkownErrors(
    errors: Array<CommandError | UnknownsError>,
    unknowns: Set<string> = new Set(),
    name?: string
): ReturnSuccess<undefined> {
    const helper = new ReturnHelper();
    for (const error of errors) {
        if (Array.isArray((error as UnknownsError).path)) {
            const unknownError = error as UnknownsError;
            const pathKey = unknownError.path.join(":");
            if (!unknowns.has(pathKey)) {
                const { path, ...allowed } = unknownError;
                helper.addErrors({
                    ...allowed,
                    // This will break when translations are added, not sure how best to do this
                    text: name ? `${error.text} for ${name}` : error.text
                });
                unknowns.add(pathKey);
            }
        } else {
            helper.addErrors(error);
        }
    }
    return helper.succeed();
}

export function parseThenValidate(
    reader: StringReader,
    walker: NBTWalker,
    node?: NodeInfo
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper();
    const parseResult = parseAnyNBTTag(reader, []);
    const parseData = parseResult.data;
    if (
        parseData &&
        (helper.merge(parseResult) || parseData.correctness > Correctness.NO)
    ) {
        if (node) {
            if (!isNoNBTInfo(node)) {
                const result = parseData.tag.validate(node, walker);
                helper.merge(result, { errors: false });
                helper.merge(solveUnkownErrors(result.errors));
            }
        }
        return helper.succeed();
    } else {
        return helper.fail();
    }
}

export const nbtParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const ctxdatafn = startPaths(paths, info.path || []);
        const data = ctxdatafn && ctxdatafn(info.context);
        return helper.return(validateParse(reader, info, data));
    }
};
