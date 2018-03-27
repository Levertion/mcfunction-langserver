import { StringReader } from "../../../../brigadier_components/string_reader";
import { HighlightScope } from "../../../../highlight/highlight_util";
import { Parser, ParseResult, SubAction, SuggestResult } from "../../../../types";
import { NBTWalker } from "./doc_walker";
import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTag } from "./tag/nbt_tag";
import { NBTError } from "./util/nbt_error";
import { NBTHoverAction } from "./util/nbt_util";

function getRealActions(actions: NBTHoverAction[], root: NBTTag<any>): SubAction[] {
    return actions.map((v) => ({
        data: typeof v.data === "string" ? v.data : v.data(v.path || [], root),
        high: v.end,
        low: v.start,
        type: "hover",
    } as SubAction));
}

export class NBTParser implements Parser {
    public parse(reader: StringReader): ParseResult {
        try {
            const tag = new NBTTagCompound({});
            tag.parse(reader);
            return {
                actions: getRealActions(tag.getHover(), tag),
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
                actions: ex.data.parsed ? getRealActions(ex.data.parsed.getHover(), ex.data.parsed) : undefined,
                errors: [ex.error],
                successful: false,
            };
        }
    }

    public getSuggestions(text: string): SuggestResult[] {
        const reader = new StringReader(text);
        const parsed = new NBTTagCompound({});
        try {
            parsed.parse(reader);
        } catch (e) {
            // Eat NBT erorr
        }
        const walker = new NBTWalker(parsed);
        const node = walker.getFinalNode([]);
        if (node !== undefined) {
            //
        }
        return [];
    }
}
