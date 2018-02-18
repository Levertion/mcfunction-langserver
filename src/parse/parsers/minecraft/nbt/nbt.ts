import { StringReader } from "../../../../brigadier_components/string_reader";
import { Parser, ParseResult, SuggestResult } from "../../../../types";
import { parseTag } from "./tag_parser";
import { NBTError } from "./util/nbt_error";

export class NBTParser implements Parser {
    public parse(reader: StringReader): ParseResult {
        try {
            const tag = parseTag(reader);
        } catch (e) {
            const ex = e as NBTError;
            return {
                errors: [ex.error],
                successful: false,
            };
        }
        return {
            successful: true,
        };
    }

    public getSuggestions(): SuggestResult[] {
        return [];
    }
}
