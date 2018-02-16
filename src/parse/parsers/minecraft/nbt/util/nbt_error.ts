import { CommandError } from "../../../../../brigadier_components/errors";
import { NBTTag } from "../tag/nbt_tag";

export class NBTError {
    public error: CommandError;
    public data: Data;
    public correct: CorrectLevel;

    constructor(err: CommandError, data: Data = {}, correct: CorrectLevel = 0) {
        this.error = err;
        this.data = data;
        this.correct = correct;
    }
}

export enum CorrectLevel {
    NO, MAYBE, YES,
}

export interface Data {
    part?: "key" | "value";
    completions?: string[];
    parsed?: NBTTag;
    path?: string[];
    keys?: string[];
    pos?: number;
}
