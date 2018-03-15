import { StringReader } from "../../../../brigadier_components/string_reader";
import { Parser, ParseResult, SubAction, SuggestResult } from "../../../../types";
import { NBTWalker } from "./doc_walker";
import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTag } from "./tag/nbt_tag";
import { parseTag } from "./tag_parser";
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
            // @ts-ignore
            const tag = parseTag(reader);
            return {
                actions: getRealActions(tag.getHover(), tag),
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
        let parsed: NBTTag<any>;
        try {
            parsed = parseTag(reader);
        } catch (e) {
            const ex = e as NBTError;
            parsed = ex.data.parsed || new NBTTagCompound({});
        }
        const walker = new NBTWalker(parsed);
        const node = walker.getFinalNode([]);
        if (node !== undefined) {
            //
        }
        return [];
    }
}
