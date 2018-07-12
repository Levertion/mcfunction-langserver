import {
    BlankCommandError,
    CommandError,
    fillBlankError
} from "../brigadier_components/errors";
import {
    BCE,
    CE,
    Failure,
    failure,
    MiscInfo,
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
    return { actions: [], errors: [], suggestions: [], misc: [] };
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
    private readonly suggesting?: boolean;

    public constructor(suggesting?: ParserInfo | boolean) {
        if (typeof suggesting !== "undefined") {
            if (typeof suggesting === "boolean") {
                this.suggesting = suggesting;
                return;
            }
            this.suggesting = suggesting.suggesting;
        }
    }

    public addActions(...actions: SubAction[]): this {
        if (this.suggesting === undefined || !this.suggesting) {
            this.data.actions.push(...actions);
        }
        return this;
    }

    public addErrors(...errs: Errorkind[]): this {
        if (this.suggesting === undefined || !this.suggesting) {
            this.data.errors.push(...errs);
        }
        return this;
    }

    public addMisc(...others: MiscInfo[]): this {
        if (this.suggesting === undefined || !this.suggesting) {
            this.data.misc.push(...others);
        }
        return this;
    }
    public addSuggestion(
        start: number,
        text: string,
        kind?: Suggestion["kind"],
        description?: string
    ): this {
        if (this.suggesting === undefined || this.suggesting) {
            this.addSuggestions({ start, text, kind, description });
        }
        return this;
    }
    public addSuggestions(...suggestions: SuggestResult[]): this {
        if (this.suggesting === undefined || this.suggesting) {
            this.data.suggestions.push(...suggestions);
        }
        return this;
    }

    public fail(err?: Errorkind): ReturnFailure<undefined, Errorkind> {
        if (!!err && !this.suggesting) {
            this.addErrors(err);
        }
        return {
            ...this.getShared(),
            kind: failure as Failure
        } as ReturnFailure<undefined, Errorkind>;
    }

    public failWithData<T>(data: T): ReturnFailure<T, Errorkind> {
        return {
            ...this.getShared(),
            data,
            kind: failure as Failure
        };
    }
    public getShared(): ReturnData<Errorkind> {
        return this.data;
    }
    public hasErrors(): boolean {
        return this.data.errors.length > 0;
    }
    public merge<T>(
        merge: ReturnedInfo<T, Errorkind, any>,
        blockSuggestions: boolean = false
    ): merge is ReturnSuccess<T, Errorkind> {
        if (typeof this.suggesting === "boolean") {
            if (this.suggesting) {
                if (!blockSuggestions) {
                    this.mergeSuggestions(merge);
                }
            } else {
                this.mergeSafe(merge);
            }
        } else {
            if (!blockSuggestions) {
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
        return {
            ...this.getShared(),
            data,
            kind: success as Success
        };
    }

    private mergeSafe(merge: ReturnData<Errorkind>): void {
        this.addActions(...merge.actions);
        this.addErrors(...merge.errors);
        this.addMisc(...merge.misc);
    }

    private mergeSuggestions(merge: ReturnData<Errorkind>): void {
        this.addSuggestions(...merge.suggestions);
    }
}

export function prepareForParser(
    info: ReturnedInfo<any>,
    suggesting: boolean | ParserInfo
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper(suggesting);
    if (helper.merge(info)) {
        return helper.succeed();
    } else {
        return helper.fail();
    }
}
