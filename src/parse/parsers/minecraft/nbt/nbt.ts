import { StringReader } from "../../../../brigadier_components/string_reader";
import { Parser, ParseResult, SuggestResult } from "../../../../types";
import { parseTag } from "./tag_parser";
import { NBTError } from "./util/nbt_error";

export class NBTParser implements Parser {
    public parse(reader: StringReader): ParseResult {
        try {
            // @ts-ignore
            const tag = parseTag(reader);
            return {
                actions: tag.getActions(),
                successful: true,
            };
        } catch (e) {
            const ex = e as NBTError;
            return {
                actions: ex.data.parsed ? ex.data.parsed.getActions() : undefined,
                errors: [ex.error],
                successful: false,
            };
        }
    }

    public getSuggestions(): SuggestResult[] {
        return [];
    }
}
