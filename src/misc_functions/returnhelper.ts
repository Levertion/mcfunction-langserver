import {
    BlankCommandError,
    CommandError,
    fillBlankError
} from "../brigadier_components/errors";
import { StringReader } from "../brigadier_components/string_reader";
import {
    BCE,
    CE,
    failure,
    Failure,
    ParserInfo,
    ReturnData,
    ReturnedInfo,
    ReturnFailure,
    ReturnSuccess,
    SubAction,
    success,
    Success,
    Suggestion,
    SuggestResult
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
export function isSuccessful<T, E extends BCE = CE>(
    input: ReturnedInfo<T, E, any>
): input is ReturnSuccess<T, E> {
    return input.kind === success;
}

export function returnSwitch<T, E extends BCE = CE, K = undefined>(
    data: ReturnedInfo<T, E, K>,
    succeed: (data: ReturnSuccess<T, E>) => any = () => undefined,
    fail: (data: ReturnFailure<K, E>) => any = () => undefined
): void {
    if (isSuccessful(data)) {
        succeed(data);
    } else {
        fail(data);
    }
}

/**
 * Fill the blank errors in data with 'real' errors
 * MODIFIES `data`
 * @param data The data to modify
 * @param start The starting position of the area the errors should cover
 * @param end The end position
 */
export function fillBlanks<T>(
    data: ReturnedInfo<T, BCE>,
    start: number,
    end: number
): ReturnedInfo<T>;
export function fillBlanks(
    data: ReturnData<BCE>,
    start: number,
    end: number
): ReturnData {
    const errors = [];
    for (const err of data.errors) {
        errors.push(fillBlankError(err, start, end));
    }
    return { ...data, errors };
}

export class ReturnHelper<Errorkind extends BlankCommandError = CommandError> {
    private readonly data: ReturnData<Errorkind> = createReturn<Errorkind>();

    public addActions(...actions: SubAction[]): void {
        this.data.actions.push(...actions);
    }
    public addErrors(...errs: Errorkind[]): void {
        this.data.errors.push(...errs);
    }
    public addSuggestion(
        start: number,
        text: string,
        kind?: Suggestion["kind"],
        description?: string
    ): void {
        this.addSuggestions({ start, text, kind, description });
    }
    public addSuggestions(...suggestions: SuggestResult[]): void {
        this.data.suggestions.push(...suggestions);
    }

    public fail(
        err?: Errorkind,
        info?: ParserInfo
    ): ReturnFailure<undefined, Errorkind> {
        if (!!err && (!info || !info.suggesting)) {
            this.addErrors(err);
        }
        return Object.assign(
            this.getShared(),
            {
                kind: failure as Failure
            },
            ({} as any) as { data: undefined }
        );
    }
    public failWithData<T>(data: T): ReturnFailure<T, Errorkind> {
        return Object.assign(this.getShared(), {
            data,
            kind: failure as Failure
        });
    }
    public getShared(): ReturnData<Errorkind> {
        return this.data;
    }
    public hasErrors(): boolean {
        return this.data.errors.length > 0;
    }
    public merge<T>(
        merge: ReturnedInfo<T, Errorkind, any>,
        suggest: boolean = true,
        info?: ParserInfo
    ): merge is ReturnSuccess<T, Errorkind> {
        if (!!info) {
            if (suggest && info.suggesting) {
                this.mergeSuggestions(merge);
            } else {
                this.mergeSafe(merge);
            }
        } else {
            if (suggest) {
                this.mergeSuggestions(merge);
            }
            this.mergeSafe(merge);
        }
        return isSuccessful(merge);
    }

    public succeed<T extends undefined>(
        data?: T
    ): ReturnSuccess<undefined, Errorkind>;
    public succeed<T>(data: T): ReturnSuccess<T, Errorkind>;
    public succeed<T>(data: T): ReturnSuccess<T, Errorkind> {
        return Object.assign(this.getShared(), {
            data,
            kind: success as Success
        });
    }

    public suggestUnlessRead<T>(
        merge: ReturnedInfo<T, Errorkind>,
        reader: StringReader,
        info?: ParserInfo
    ): merge is ReturnSuccess<T, Errorkind> {
        return this.merge(merge, !reader.canRead(), info);
    }

    private mergeSafe(merge: ReturnData<Errorkind>): void {
        this.addActions(...merge.actions);
        this.addErrors(...merge.errors);
    }

    private mergeSuggestions(merge: ReturnData<Errorkind>): void {
        this.addSuggestions(...merge.suggestions);
    }
}
