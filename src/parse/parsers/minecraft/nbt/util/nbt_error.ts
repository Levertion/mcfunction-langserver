import { CommandError } from "../../../../../brigadier_components/errors";
import { mergeDeep } from "../../../../../imported_utils/merge_deep";
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

    public create(data?: Data, merge: boolean = true, correct?: CorrectLevel) {
        return new NBTError(
            this.error,
            merge ? mergeDeep({}, data || {}, this.data) : data || this.data,
            correct || this.correct,
        );
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
