import { NBTNode } from "mc-nbt-paths";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { ReturnedInfo, ReturnSuccess } from "../../../../types";
import { runSuggestFunction } from "../doc-walker-func";
import { TagType } from "../tag/nbt-tag";
import {
    isNoNBTNode,
    isRootNode,
    isTypedNode,
    TypedNode
} from "./doc-walker-util";

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
    correct: Correctness;
}

export enum Correctness {
    NO = 0,
    MAYBE = 1,
    CERTAIN = 2
}

export function tryExponential(reader: StringReader): ReturnedInfo<number> {
    const helper = new ReturnHelper();
    const f = reader.readFloat();
    if (!helper.merge(f, { errors: false })) {
        return helper.fail();
    }
    const cur = reader.peek();
    if (!(cur === "e" || cur === "E")) {
        return helper.fail();
    }
    reader.skip();
    // Returns beyond here because it must be scientific notation
    const exp = reader.readInt();
    if (helper.merge(exp)) {
        return helper.succeed(f.data * Math.pow(10, exp.data));
    } else {
        return helper.fail();
    }
}

const suggestTypes: { [k in TypedNode["type"]]?: string } = {
    byte_array: "[B;",
    compound: "{",
    int_array: "[I;",
    list: "[",
    long_array: "[L;"
};

export function getStartSuggestion(node: NBTNode): string | undefined {
    if (isTypedNode(node) && suggestTypes.hasOwnProperty(node.type)) {
        return suggestTypes[node.type];
    }
    return undefined;
}

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
                    helper.addSuggestions({ start: cursor, text: v });
                } else if ("function" in v) {
                    runSuggestFunction(
                        v.function.id,
                        v.function.params
                    ).forEach(v2 =>
                        helper.addSuggestions({ start: cursor, text: v2 })
                    );
                } else {
                    helper.addSuggestions({
                        description: v.description,
                        start: cursor,
                        text: v.value
                    });
                }
            });
        }
    } else {
        const start = getStartSuggestion(node);
        if (start) {
            helper.addSuggestion(cursor, start);
        }
    }
    /* if (isCompoundNode(node) && node.children) {
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
    } */
    return helper.succeed();
}

export function createSuggestions(
    node: NBTNode,
    cursor: number
): ReturnSuccess<undefined> {
    const helper = new ReturnHelper();
    const sugg = node.suggestions;
    if (sugg) {
        sugg.forEach(v => {
            if (typeof v === "string") {
                helper.addSuggestion(cursor, v);
            } else if ("function" in v) {
                runSuggestFunction(v.function.id, v.function.params).forEach(
                    v2 => helper.addSuggestion(cursor, v2)
                );
            } else {
                helper.addSuggestion(cursor, v.value, undefined, v.description);
            }
        });
    }
    return helper.succeed();
}

export const tagid2Name: { [Type in TagType]: string } = {
    byte: "byte",
    byte_array: "byte[]",
    compound: "compound",
    double: "double",
    float: "float",
    int: "int",
    int_array: "int[]",
    list: "list",
    long: "long",
    long_array: "long[]",
    short: "short",
    string: "string"
};

export const getHoverText = (node: NBTNode) => {
    const desc = node.description || "";
    if (!isTypedNode(node)) {
        return desc;
    }
    if (isRootNode(node)) {
        return desc;
    }
    if (isNoNBTNode(node)) {
        return desc;
    }
    return `(${tagid2Name[node.type]}) ${desc}`;
};
