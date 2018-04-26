import { BlankCommandError, CommandError, fillBlankError } from "../brigadier_components/errors";
import { ImmutableStringReader } from "../brigadier_components/string_reader";
import {
    BCE, CE, Failure, ReturnData, ReturnedInfo, ReturnFailure, ReturnSuccess,
    SubAction, Success, SuggestResult,
} from "../types";

/**
 * Create an instance of the common return type
 */
function createReturn<ErrorKind extends BCE = CE>(): ReturnData<ErrorKind> {
    return { actions: [], errors: [], suggestions: [] };
}

/**
 * Test if `input` is successful
 * @param input The info to test
 */
export function isSuccessful<T, E extends BCE = CE>(input: ReturnedInfo<T, E>): input is ReturnSuccess<T, E> {
    return input.kind === Success;
}

/**
 * Fill the blank errors in data with 'real' errors
 * MODIFIES `data`
 * @param data The data to modify
 * @param start The starting position of the area the errors should cover
 * @param end The end position
 */
export function fillBlanks<T>(data: ReturnedInfo<T, BCE>, start: number, end: number): ReturnedInfo<T, CE>;
export function fillBlanks(data: ReturnData<BCE>, start: number, end: number): ReturnData<CE> {
    const errors = [];
    for (const err of data.errors) {
        errors.push(fillBlankError(err, start, end));
    }
    return Object.assign(data, { errors });
}

export class ReturnHelper<Errorkind extends BlankCommandError = CommandError> {
    private data = createReturn<Errorkind>();

    public getShared(): ReturnData<Errorkind> {
        return this.data;
    }

    public succeed<T = undefined>(data: T): ReturnSuccess<T, Errorkind> {
        return Object.assign(this.getShared(), {
            data,
            kind: Success as Success,
        });
    }
    public fail(err?: Errorkind): ReturnFailure<Errorkind> {
        if (!!err) {
            this.addErrors(err);
        }
        return Object.assign(this.getShared(), {
            kind: Failure as Failure,
        });
    }
    public addErrors(...errs: Errorkind[]) {
        this.data.errors.push(...errs);
    }
    public addSuggestions(...suggestions: SuggestResult[]) {
        this.data.suggestions.push(...suggestions);
    }
    public addActions(...actions: SubAction[]) {
        this.data.actions.push(...actions);
    }

    public mergeIfCantRead<T>(merge: ReturnedInfo<T, Errorkind>,
        reader: ImmutableStringReader): merge is ReturnSuccess<T, Errorkind> {
        this.merge(merge, !reader.canRead());
        return isSuccessful(merge);
    }
    public merge<T>(merge: ReturnedInfo<T, Errorkind>, suggest = true): merge is ReturnSuccess<T, Errorkind> {
        if (suggest) {
            this.mergeSuggestions(merge);
        }
        this.mergeSafe(merge);
        return true;
    }

    private mergeSuggestions(merge: ReturnData<Errorkind>) {
        this.addSuggestions(...merge.suggestions);
    }
    private mergeSafe(merge: ReturnData<Errorkind>) {
        this.addActions(...merge.actions);
        this.addErrors(...merge.errors);
    }
}
