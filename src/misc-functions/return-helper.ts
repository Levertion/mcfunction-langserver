// tslint:disable:helper-return
import {
    BlankCommandError,
    CommandError,
    fillBlankError
} from "../brigadier/errors";
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

export interface MergeOptions {
    actions?: boolean;
    errors?: boolean;
    misc?: boolean;
    suggestions?: boolean;
}

export class ReturnHelper<Errorkind extends BlankCommandError = CommandError> {
    private readonly data: ReturnData<Errorkind> = createReturn<Errorkind>();
    private readonly suggestMode?: boolean;

    public constructor(suggesting?: ParserInfo | boolean) {
        if (typeof suggesting !== "undefined") {
            if (typeof suggesting === "boolean") {
                this.suggestMode = suggesting;
                return;
            }
            this.suggestMode = suggesting.suggesting;
        }
    }

    public addActions(...actions: SubAction[]): this {
        if (this.suggestMode === undefined || !this.suggestMode) {
            this.data.actions.push(...actions);
        }
        return this;
    }

    public addErrors(...errs: Errorkind[]): this {
        if (this.suggestMode === undefined || !this.suggestMode) {
            this.data.errors.push(...errs);
        }
        return this;
    }

    public addFileErrorIfFalse(
        option: boolean,
        filePath: string,
        group: string,
        message: string
    ): option is true {
        if (!option) {
            this.addMisc({
                filePath,
                group,
                kind: "FileError",
                message
            });
        } else {
            this.addMisc({ group, filePath, kind: "ClearError" });
        }
        return option;
    }
    public addMisc(...others: MiscInfo[]): this {
        if (this.suggestMode === undefined || !this.suggestMode) {
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
        this.addSuggestions({
            description,
            kind,
            start,
            text
        });

        return this;
    }
    public addSuggestions(...suggestions: SuggestResult[]): this {
        if (this.suggestMode === undefined || this.suggestMode) {
            this.data.suggestions.push(...suggestions);
        }
        return this;
    }

    public fail(err?: Errorkind): ReturnFailure<undefined, Errorkind> {
        if (!!err && !this.suggestMode) {
            this.addErrors(err);
        }
        return {
            ...this.getShared(),
            kind: failure as Failure
        } as ReturnFailure<undefined, Errorkind>;
    }

    public failWithData<T>(data: T): ReturnFailure<T, Errorkind> {
        return { ...this.getShared(), data, kind: failure as Failure };
    }

    public getShared(): ReturnData<Errorkind> {
        return this.data;
    }
    public merge<T>(
        merge: ReturnedInfo<T, Errorkind, any>,
        suggestOverride?: MergeOptions
    ): merge is ReturnSuccess<T, Errorkind> {
        this.mergeChain(merge, suggestOverride);
        return isSuccessful(merge);
    }

    public mergeChain(
        merge: ReturnedInfo<any, Errorkind>,
        {
            suggestions = this.suggestMode === undefined
                ? true
                : this.suggestMode,
            errors = this.suggestMode === undefined || !this.suggestMode,
            actions = this.suggestMode === undefined || !this.suggestMode,
            misc = this.suggestMode === undefined || !this.suggestMode
        }: MergeOptions = {}
    ): this {
        if (suggestions) {
            this.addSuggestions(...merge.suggestions);
        }
        if (errors) {
            this.addErrors(...merge.errors);
        }
        if (actions) {
            this.addActions(...merge.actions);
        }
        if (misc) {
            this.addMisc(...merge.misc);
        }
        return this;
    }

    public return<
        T = undefined,
        E = undefined,
        R extends ReturnedInfo<T, Errorkind, E> = ReturnedInfo<T, Errorkind, E>
    >(other: R): R {
        if (this.merge(other)) {
            return this.succeed(other.data) as R;
        } else {
            return this.failWithData(other.data) as R;
        }
    }

    public succeed<T extends undefined>(
        data?: T
    ): ReturnSuccess<undefined, Errorkind>;
    public succeed<T>(data: T): ReturnSuccess<T, Errorkind>;
    public succeed<T>(data: T): ReturnSuccess<T, Errorkind> {
        return { ...this.getShared(), data, kind: success as Success };
    }
}

export function prepareForParser(
    info: ReturnedInfo<any, any, any>,
    suggesting: boolean | ParserInfo
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper(suggesting);
    if (helper.merge(info)) {
        return helper.succeed();
    } else {
        return helper.fail();
    }
}

export function getReturned<T>(value: T | undefined): ReturnedInfo<T> {
    const helper = new ReturnHelper();
    if (typeof value === "undefined") {
        return helper.fail();
    } else {
        return helper.succeed(value);
    }
}
