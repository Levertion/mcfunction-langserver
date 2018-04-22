import { SubAction, SuggestResult } from "../types";
import { BCE, CE, fillBlankError } from "./errors";
import { ImmutableStringReader } from "./string_reader";

//#region Type definitions
//#region Option
enum Option {
    Success,
    Failure,
}
/**
 * A value representing a success
 */
export type Success = Option.Success;
export const Success: Success = Option.Success;

/**
 * A value representing a failure
 */
export const Failure: Failure = Option.Failure;
export type Failure = Option.Failure;
//#endregion

//#region ReturnData
/**
 * General return data. Can be expanded into a ReturnInfo
 */
export interface ReturnData<ErrorKind extends BCE = CE> {
    errors: ErrorKind[];
    suggestions: SuggestResult[];
    actions: SubAction[];
}

/**
 * A general return type which can either succeed or fail
 */
export type ReturnedInfo<T, ErrorKind extends BCE = CE> =
    ReturnSuccess<T, ErrorKind> | ReturnFailure<ErrorKind>;

/**
 * A failing return
 */
export interface ReturnFailure<ErrorKind extends BCE = CE> extends ReturnData<ErrorKind> {
    kind: Failure;
}

/**
 * A succeeding return
 */
export interface ReturnSuccess<T, ErrorKind extends BCE = CE> extends ReturnData<ErrorKind> {
    kind: Success;
    data: T;
}
//#endregion
//#endregion

//#region Helper functions

/**
 * Create an instance of the common return type
 */
export function createReturn<ErrorKind extends BCE = CE>(): ReturnData<ErrorKind> {
    return { actions: [], errors: [], suggestions: [] };
}

/**
 * Create a successful return from the common data
 *
 * MODIFIES shared
 * @param shared The shared return data
 * @param data The thing to return
 */
export function succeed<T = undefined,
    E extends BCE = CE>(shared: ReturnData<E>, data: T): ReturnSuccess<T, E> {
    return Object.assign(shared, {
        data,
        kind: Success as Success,
    });
}

/**
 * Create a failure for return
 *
 * MODIFIES shared
 * @param shared The shared return data
 * @param err The error that caused the failure
 */
export function fail<E extends BCE = CE>(shared: ReturnData<E>, err?: E): ReturnFailure<E> {
    if (!!err) {
        shared.errors.push(err);
    }
    return Object.assign(shared, {
        kind: Failure as Failure,
    });
}

/**
 * Merge the suggestions if `reader` can't read
 * @param reader The reader which mustn't be able to read
 */
export function mergeIfCantRead<T, E extends BCE = CE>(main: ReturnData<E>,
    merge: ReturnedInfo<T, E>, reader: ImmutableStringReader): merge is ReturnSuccess<T, E> {
    mergeInto(main, merge, !reader.canRead());
    return isSuccessful(merge);
}

/**
 * Merge main and merge. Returns true if merge is successful, false otherwise
 * @param main The main data to return
 * @param merge The data to merge into it
 */
export function testMerge<T, E extends BCE = CE>(main: ReturnData<E>,
    merge: ReturnedInfo<T, E>, includeSuggestions = true): merge is ReturnSuccess<T, E> {
    mergeInto(main, merge, includeSuggestions);
    return isSuccessful(merge);
}

/**
 * Merge the contents of `merge` into `main`
 *
 * MODIFIES `main`
 * @param main The data to merge into
 * @param merge Merged content
 */
export function mergeInto<E extends BCE = CE>(main: ReturnData<E>, merge: ReturnData<E>, includeSuggestions = true) {
    mergeSafe(main, merge);
    if (includeSuggestions) {
        mergeSuggestions(main, merge);
    }
}

function mergeSuggestions<E extends BCE = CE>(main: ReturnData<E>, merge: ReturnData<E>) {
    main.suggestions.push(...merge.suggestions);
}

function mergeSafe<E extends BCE = CE>(main: ReturnData<E>, merge: ReturnData<E>) {
    main.actions.push(...merge.actions);
    main.errors.push(...merge.errors);
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

//#endregion
