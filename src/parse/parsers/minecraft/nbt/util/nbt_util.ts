import { CommandError, CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { CorrectLevel, Data, NBTError } from "./nbt_error";

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

export function parseIntNBT(reader: StringReader): number {
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
}

export function parseFloatNBT(reader: StringReader): number {
    const start = reader.cursor;
    let out = 0;
    try {
        const f = reader.readFloat();
        if (reader.peek() !== "e" && reader.peek() !== "E") {
            throw {};
        }
        const exp = reader.readInt();
        out = f * Math.pow(10, exp);
    } catch (e) {
        reader.cursor = start;
        out = reader.readFloat();
    }
    return out;
}
