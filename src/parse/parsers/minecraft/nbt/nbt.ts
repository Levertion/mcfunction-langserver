import { StringReader } from "../../../../brigadier_components/string_reader";
import { HighlightScope } from "../../../../highlight/highlight_util";
import { Parser, ParseResult, ParserInfo, SubAction, SuggestResult } from "../../../../types";
import { ContextHandler, ContextInformation } from "../../../context";
import { NBTWalker } from "./doc_walker";
import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTag } from "./tag/nbt_tag";
import { NBTError } from "./util/nbt_error";
import { NBTHoverAction } from "./util/nbt_util";

export interface NBTContextData {
    type: "entity" | "block" | "item";
    id: string;
}

//#region 18w11a
export const summon: ContextHandler = {
    handle: (args: string[]) => ({
        id: args[1],
        type: "entity",
    }) as NBTContextData,
    path: ["summon", "entity", "pos", "nbt"],
};
//#endregion

function getRealActions(actions: NBTHoverAction[], root: NBTTag<any>, context?: NBTContextData): SubAction[] {
    return actions.map((v) => ({
        data: typeof v.data === "string" ? v.data : v.data(v.path || [], root, context),
        high: v.end,
        low: v.start,
        type: "hover",
    } as SubAction));
}

export class NBTParser implements Parser {
    // @ts-ignore
    public parse(reader: StringReader, properties: ParserInfo, context?: ContextInformation): ParseResult {
        const contData = context ? context.handlerInfo as NBTContextData : undefined;
        try {
            const tag = new NBTTagCompound({});
            tag.parse(reader);
            return {
                actions: getRealActions(tag.getHover(), tag, contData),
                highlight: tag.getHighlight().map(
                    (v) => ({
                        end: v.end,
                        scopes: typeof v.scopes === "string" ? [v.scopes] : v.scopes,
                        start: v.start,
                    }) as HighlightScope,
                ),
                successful: true,
            };
        } catch (e) {
            const ex = e as NBTError;

            return {
                actions: !!ex.data ? (ex.data.parsed ?
                    getRealActions(ex.data.parsed.getHover(), ex.data.parsed, contData)
                    : undefined) : [],
                errors: [ex.error],
                successful: false,
            };
        }
    }
    // @ts-ignore (no properties)
    public getSuggestions(text: string, properties: ParserInfo, context?: ContextInformation): SuggestResult[] {
        if (context === undefined) {
            return [];
        }
        const contData = context.handlerInfo as NBTContextData;
        const reader = new StringReader(text);
        const parsed = new NBTTagCompound({});
        let ex: NBTError | undefined;
        try {
            parsed.parse(reader);
        } catch (e) {
            ex = e as NBTError;
        }
        if (ex === undefined) {
            return [];
        }
        const walker = new NBTWalker(parsed);
        const node = walker.getFinalNode([contData.type, contData.id].concat(ex.data.path || []));
        if (node !== undefined) {
            //
        }
        return [];
    }
}
