import { AssertionError, strictEqual } from "assert";
import { CommandError, isCommandError } from "../brigadier_components/errors";
import { NamespacedName } from "../data/types";
import { isSuccessful, namespacesEqual } from "../misc_functions";
import { ReturnedInfo, ReturnSuccess, SuggestResult } from "../types";

/**
 * Information about a single expected error
 */
export interface ErrorInfo {
    code: string;
    range: {
        end: number;
        start: number;
    };
}

/**
 * Ensures that the right errors from `expected` are in `realErrors`s
 * @param expected The errors which are expected
 * @param realErrors The actual errors
 */
export function assertErrors(
    expected: ErrorInfo[],
    realErrors: CommandError[] | undefined
): void {
    if (!!realErrors) {
        if (expected.length < realErrors.length) {
            throw new AssertionError({
                message: `Too many errors were given. Actual errors were: '${JSON.stringify(
                    realErrors
                )}'`
            });
        }
        if (expected.length > realErrors.length) {
            throw new AssertionError({
                message: `Too few errors were given. Actual errors were: '${JSON.stringify(
                    realErrors
                )}'`
            });
        }
        for (const info of expected) {
            const index = realErrors.findIndex(v => errorMatches(info, v));
            if (index === -1) {
                throw new AssertionError({
                    message: `Expected errors to contain an error with code '${
                        info.code
                    }' and range ${info.range.start}...${
                        info.range.end
                    }, but none met this. The errors were ${JSON.stringify(
                        realErrors
                    )}`
                });
            }
            realErrors.splice(index, 1);
        }
    } else if (expected.length > 0) {
        throw new AssertionError({
            message: "Expected an array of errors, got none"
        });
    }
}

/**
 * Creates a function which confirms whether or not a passed value is a matching error to `expected`.
 *
 * This is designed to be used in `assert.throws`.
 * @param expected The data about the expected error
 */
export function thrownErrorAssertion(
    expected: ErrorInfo
): (error: any) => true {
    return (error: any) => {
        if (isCommandError(error)) {
            if (errorMatches(expected, error)) {
                return true; // Allows assert.throws to pass
            } else {
                throw new AssertionError({
                    message: `Expected error with code '${
                        expected.code
                    } and range ${expected.range.start}...${
                        expected.range.end
                    }', but got '${JSON.stringify(error)}'`
                });
            }
        } else {
            throw new AssertionError({
                message: `Got an error which isn't a command error: ${JSON.stringify(
                    error
                )} `
            });
        }
    };
}

/**
 * Information about a single expected suggestion
 */
export interface SuggestionInfo {
    start: number;
    text: string;
}

/**
 * Information about a single expected suggestion.
 * If a string is given, the start is taken to be `start`
 */
export type SuggestedOption = SuggestionInfo | string;

/**
 * Ensure that the suggestions match the assertion about them
 */
export function assertSuggestions(
    expected: SuggestedOption[],
    actual: SuggestResult[] | undefined,
    start: number = 0
): void {
    if (!!actual) {
        if (expected.length > actual.length) {
            throw new AssertionError({
                message: `Too many suggestions were given. Actual suggestions were: '${JSON.stringify(
                    actual
                )}'`
            });
        }
        if (expected.length < actual.length) {
            throw new AssertionError({
                message: `Too few suggestions were given. Actual suggestions were: '${JSON.stringify(
                    actual
                )}'`
            });
        }
        for (const expectation of expected) {
            const [startText, position]: [string, number] =
                typeof expectation === "string"
                    ? [expectation, start]
                    : [expectation.text, expectation.start];
            const index = actual.findIndex(v => {
                if (typeof v === "string") {
                    return position === 0 && v === startText;
                } else {
                    return v.text === startText && v.start === position;
                }
            });
            if (index === -1) {
                throw new AssertionError({
                    message: `Expected suggestions to contain a suggestion starting with text '${startText}' at position ${position}, but this was not found: got ${JSON.stringify(
                        actual
                    )} instead`
                });
            }
            actual.splice(index, 1);
        }
    } else if (expected.length > 0) {
        throw new AssertionError({
            message: "Expected an array of suggestions, got none"
        });
    }
}

function errorMatches(expected: ErrorInfo, error: CommandError): boolean {
    return (
        expected.code === error.code &&
        expected.range.start === error.range.start &&
        expected.range.end === error.range.end
    );
}

export function assertNamespaces(
    expected: NamespacedName[],
    actual: NamespacedName[]
): void {
    const results = actual.slice();
    for (const expectation of expected) {
        let found = false;
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            if (namespacesEqual(element, expectation)) {
                found = true;
                results.splice(i, 1);
                break;
            }
        }
        if (!found) {
            throw new AssertionError({
                message: `Expected to find a path with namespace '${
                    expectation.namespace
                }' and path ${expectation.path}, but none matched`
            });
        }
    }
    if (results.length > 0) {
        throw new AssertionError({
            message: `Remaining paths are ${results
                .map(v => JSON.stringify(v))
                .join()}`
        });
    }
}

export function assertReturn<T>(
    val: ReturnedInfo<T>,
    shouldSucceed: boolean,
    errors: ErrorInfo[] = [],
    suggestions: Array<SuggestionInfo | string> = [],
    numActions: number = 0,
    suggestStart: number = 0
): val is ReturnSuccess<T> {
    if (isSuccessful(val) === shouldSucceed) {
        assertErrors(errors, val.errors);
        assertSuggestions(suggestions, val.suggestions, suggestStart);
        strictEqual(
            val.actions.length,
            numActions,
            `incorrect Number of expected actions: '${JSON.stringify(
                val.actions
            )}'`
        );
        return shouldSucceed;
    } else {
        throw new AssertionError({
            message: `Expected value given to ${
                shouldSucceed ? "succeed" : "fail"
            }, but it didn't. Value is: '${JSON.stringify(val)}'`
        });
    }
}

export function defined<T>(val: T | undefined): T {
    if (val === undefined) {
        throw new AssertionError({
            actual: val,
            message: "Expected not to be defined"
        });
    }
    return val;
}
