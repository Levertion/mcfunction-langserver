import { CommandError } from "../../../../../brigadier_components/errors";
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
