import { Parser, ParseResult, SuggestResult } from "../../../../types";

export class NBTParser implements Parser {
    public parse(): ParseResult {
        return { successful: true };
    }

    public getSuggestions(): SuggestResult[] {
        return [];
    }
}
