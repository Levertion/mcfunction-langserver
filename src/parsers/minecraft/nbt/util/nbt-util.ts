import { NBTNode } from "mc-nbt-paths";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { ReturnSuccess, SuggestResult } from "../../../../types";
import { runSuggestFunction } from "../doc-walker-func";
import { NBTTag } from "../tag/nbt-tag";
import { isCompoundNode, isListNode } from "./doc-walker-util";

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
    parsed?: NBTTag<any>;
    path?: string[];
}

export enum CorrectLevel {
    NO,
    MAYBE,
    YES
}

const parseNumberNBT = (float: boolean) => (reader: StringReader) => {
    const start = reader.cursor;
    try {
        const helper = new ReturnHelper();
        const f = reader.readFloat();
        if (!helper.merge(f)) {
            throw undefined; // This gets caught
        }
        const e = reader.readOption(["E", "e"], true, undefined, "option");
        if (!helper.merge(e)) {
            throw undefined; // This gets caught
        }
        // Returns beyond here because it must be scientific notation
        const exp = reader.readInt();
        if (helper.merge(exp)) {
            return helper.succeed(f.data * Math.pow(10, exp.data));
        } else {
            return helper.fail();
        }
    } catch (e) {
        reader.cursor = start;
        const helper = new ReturnHelper();
        const int = float ? reader.readFloat() : reader.readInt();
        if (helper.merge(int)) {
            return helper.succeed(int.data);
        } else {
            return helper.fail();
        }
    }
};

export const parseFloatNBT = parseNumberNBT(true);
export const parseIntNBT = parseNumberNBT(false);

export function getNBTSuggestions(
    node: NBTNode,
    cursor: number
): ReturnSuccess<undefined> {
    const helper = new ReturnHelper();
    if (node.suggestions) {
        const sugg = node.suggestions;
        if (sugg) {
            sugg.forEach(v => {
                if (typeof v === "string") {
                    helper.addSuggestion(cursor, v);
                } else if ("function" in v) {
                    runSuggestFunction(
                        v.function.id,
                        v.function.params
                    ).forEach(v2 => helper.addSuggestion(cursor, v2));
                } else {
                    helper.addSuggestion(
                        cursor,
                        v.value,
                        undefined,
                        v.description
                    );
                }
            });
        }
    }
    if (isCompoundNode(node) && node.children) {
        helper.addSuggestions(
            ...Object.keys(node.children).map<SuggestResult>(v => ({
                // @ts-ignore
                description: node.children[v].description,
                start: cursor,
                text: v
            }))
        );
    } else if (isListNode(node) && node.item) {
        helper.mergeChain(getNBTSuggestions(node.item, cursor));
    }
    return helper.succeed();
}
