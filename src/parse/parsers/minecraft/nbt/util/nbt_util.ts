import { CommandError, CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTContextData } from "../nbt";
import { NBTTag } from "../tag/nbt_tag";
import { CorrectLevel, Data, NBTError } from "./nbt_error";

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
    char: string,
    scopes: string[],
    data: Data,
    correct: CorrectLevel,
) {
    tryWithData(() => reader.expect(char), data, correct);
    return scopeChar(reader.cursor, scopes);
}

export function tryWithData(func: () => void, data: Data, correct: CorrectLevel): void {
    try {
        func();
    } catch (e) {
        throw new NBTError(e, data, correct);
    }
}

export function throwIfFalse(arg: boolean, err: CommandError, data: Data, correct: CorrectLevel): void {
    if (!arg) {
        throw new NBTError(err, data, correct);
    }
}

export function parseStringNBT(reader: StringReader): string {
    const start = reader.cursor;
    if (reader.canRead() && reader.peek() === "\"") {
        return reader.readQuotedString();
    } else {
        if (!reader.canRead()) {
            return "";
        }
        if (!/[A-Za-z_]/.test(reader.peek())) {
            throw new CommandErrorBuilder(
                "argument.nbt.unquoted",
                "Expected one of [A-Za-z_]",
            ).create(start, reader.cursor);
        }
        return reader.readUnquotedString();
    }
}

export function parseIntNBT(reader: StringReader, data: Data = {}, correct: CorrectLevel = 0): number {
    try {
        const start = reader.cursor;
        let out = 0;
        try {
            const f = reader.readFloat();
            if (reader.peek() !== "e" && reader.peek() !== "E") {
                throw {};
            }
            reader.skip();
            const exp = reader.readInt();
            out = f * Math.pow(10, exp);
        } catch (e) {
            reader.cursor = start;
            out = reader.readInt();
        }
        return out;
    } catch (e) {
        throw new NBTError(e, data, correct);
    }
}

export function parseFloatNBT(reader: StringReader, data: Data = {}, correct: CorrectLevel = 0): number {
    try {
        const start = reader.cursor;
        let out = 0;
        try {
            const f = reader.readFloat();
            if (reader.peek() !== "e" && reader.peek() !== "E") {
                throw {};
            }
            reader.skip();
            const exp = reader.readInt();
            out = f * Math.pow(10, exp);
        } catch (e) {
            reader.cursor = start;
            out = reader.readFloat();
        }
        return out;
    } catch (e) {
        throw new NBTError(e, data, correct);
    }
}

export const scopeChar = (end: number, scopes: string[]) => ({
    end,
    scopes,
    start: end - 1,
});
