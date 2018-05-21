import { StringReader } from "../../../../brigadier_components/string_reader";
import { isSuccessful, ReturnHelper } from "../../../../misc_functions";
import { ReturnedInfo, SuggestResult } from "../../../../types";
import { isCompoundNode, NBTNode } from "../doc_walker";
import { runSuggestFunction } from "../doc_walker_func";
import { NBTContextData } from "../nbt";
import { NBTTag } from "../tag/nbt_tag";

export const ARRAY_START = "[";
export const ARRAY_END = "]";
export const ARRAY_PREFIX_SEP = ";";
export const ARRAY_VALUE_SEP = ",";

export const LIST_START = "[";
export const LIST_END = "]";
export const LIST_VALUE_SEP = ",";

export const COMPOUND_START = "{";
export const COMPOUND_END = "}";
export const COMPOUND_KEY_VALUE_SEP = ":";
export const COMPOUND_PAIR_SEP = ",";

export interface NBTErrorData {
    correct: CorrectLevel;
    part?: "key" | "value";
    parsed?: NBTTag<any>;
    path?: string[];
    keys?: string[];
    pos?: number;
}

export enum CorrectLevel {
    NO, MAYBE, YES,
}

export interface NBTHoverAction {
    start: number;
    end: number;
    data: string | ((path: string[], root: NBTTag<any>, context?: NBTContextData) => () => string);
    path?: string[];
}

export interface NBTHighlightAction {
    start: number;
    end: number;
    scopes: string[] | string;
}

export function expectAndScope(
    reader: StringReader,
    str: string,
    scopes: string[],
    data: NBTErrorData,
) {
    const exp = reader.expect(str);
    if (!isSuccessful(exp)) {
        return ReturnHelper.fail(data);
    }
    return ReturnHelper.succeed(scopeChar(reader.cursor, scopes));
}

export function parseIntNBT(reader: StringReader): ReturnedInfo<number> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    let out = 0;
    try {
        const f = reader.readFloat();
        if (reader.peek().toLowerCase() !== "e") {
            throw undefined;
        }
        reader.skip();
        const exp = reader.readInt();
        if (helper.merge(exp) && helper.merge(f)) {
            out = f.data * Math.pow(10, exp.data);
        }
    } catch (e) {
        reader.cursor = start;
        const int = reader.readInt();
        if (helper.merge(int)) {
            out = int.data;
        }
    }
    if (helper.hasErrors()) {
        return helper.fail();
    } else {
        return helper.succeed(out);
    }
}

export function parseFloatNBT(reader: StringReader): ReturnedInfo<number> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    let out = 0;
    try {
        const f = reader.readFloat();
        if (reader.peek().toLowerCase() !== "e") {
            throw undefined;
        }
        reader.skip();
        const exp = reader.readInt();
        if (helper.merge(exp) && helper.merge(f)) {
            out = f.data * Math.pow(10, exp.data);
        }
    } catch (e) {
        reader.cursor = start;
        const int = reader.readFloat();
        if (helper.merge(int)) {
            out = int.data;
        }
    }
    if (helper.hasErrors()) {
        return helper.fail();
    } else {
        return helper.succeed(out);
    }
}

export const scopeChar = (end: number, scopes: string[]) => ({
    end,
    scopes,
    start: end - 1,
});

export function addSuggestionsToHelper(node: NBTNode, helper: ReturnHelper, reader: StringReader) {
    if (!!node.suggestions) {
        const sugg = node.suggestions;
        if (!!sugg) {
            sugg.forEach(
                (v) => {
                    if (typeof v === "string") {
                        helper.addSuggestion(reader.cursor, v);
                    } else if ("function" in v) {
                        runSuggestFunction(v.function.id, v.function.params).forEach(
                            (v2) => helper.addSuggestion(reader.cursor, v2),
                        );
                    } else {
                        helper.addSuggestion(reader.cursor, v.value, undefined, v.description);
                    }
                },
            );
        }
    }
    if (isCompoundNode(node)) {
        helper.addSuggestions(...Object.keys(node.children).map<SuggestResult>(
            (v) => ({
                description: node.children[v].description,
                start: reader.cursor,
                text: v,
            }),
        ));
    }
}
