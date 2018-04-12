import { AssertionError } from "assert";
import { CommandError, isCommandError } from "../../../../brigadier_components/errors";
import { SuggestResult } from "../../../../types";

/**
 * Information about a single expected error
 */
export interface ErrorInfo {
    range: {
        start: number,
        end: number,
    };
    code: string;
}

/**
 * Ensures that the right errors from `expected` are in `realErrors`s
 * @param expected The errors which are expected
 * @param realErrors The actual errors
 */
export function assertErrors(expected: ErrorInfo[], realErrors: CommandError[] | undefined) {
    if (!!realErrors) {
        if (expected.length < realErrors.length) {
            throw new AssertionError({
                message: `Too many errors were given. Actual errors were: '${JSON.stringify(realErrors)}'`,
            });
        }
        if (expected.length > realErrors.length) {
            throw new AssertionError({
                message: `Too few errors were given. Actual errors were: '${JSON.stringify(realErrors)}'`,
            });
        }
        for (const info of expected) {
            const index = realErrors.findIndex((v) => errorMatches(info, v));
            if (index === -1) {
                throw new AssertionError({
                    message: `Expected errors to contain an error with code '${info.code}' and range ${
                        info.range.start}...${info.range.end}, but none met this. The errors were ${
                        JSON.stringify(realErrors)}`,
                });
            }
            realErrors.splice(index, 1);
        }
    } else if (expected.length > 0) {
        throw new AssertionError({ message: "Expected an array of errors, got none" });
    }
}

/**
 * Creates a function which confirms whether or not a passed value is a matching error to `expected`.
 *
 * This is designed to be used in `assert.throws`.
 * @param expected The data about the expected error
 */
export function thrownErrorAssertion(expected: ErrorInfo): (error: any) => true {
    return (error: any) => {
        if (isCommandError(error)) {
            if (errorMatches(expected, error)) {
                return true; // Allows assert.throws to pass
            } else {
                throw new AssertionError({
                    message: `Expected error with code '${expected.code} and range ${
                        expected.range.start}...${expected.range.end}', but got '${JSON.stringify(error)}'`,
                });
            }
        } else {
            throw new AssertionError({
                message: `Got an error which isn't a command error: ${JSON.stringify(error)} `,
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
export function assertSuggestions(expected: SuggestedOption[], actual: SuggestResult[] | undefined, start: number = 0) {
    if (!!actual) {
        if (expected.length > actual.length) {
            throw new AssertionError({
                message: `Too many suggestions were given. Actual suggestions were: '${JSON.stringify(actual)}'`,
            });
        }
        if (expected.length < actual.length) {
            throw new AssertionError({
                message: `Too few suggestions were given. Actual suggestions were: '${JSON.stringify(actual)}'`,
            });
        }
        for (const expectation of expected) {
            const [beginning, position] = typeof expectation === "string" ?
                [expectation, start] : [expectation.text, expectation.start];
            const index = actual.findIndex((v) => {
                if (typeof v === "string") {
                    return position === 0 && v === beginning;
                } else {
                    return v.value === beginning && v.start === position;
                }
            });
            if (index === -1) {
                throw new AssertionError({
                    message: `Expected suggestions to contain a suggestion starting with text '${beginning
                        }' at position ${position}, but this was not found: got ${JSON.stringify(actual)} instead`,
                });
            }
            actual.splice(index, 1);
        }
    } else if (expected.length > 0) {
        throw new AssertionError({ message: "Expected an array of suggestions, got none" });
    }
}

function errorMatches(expected: ErrorInfo, error: CommandError): boolean {
    return expected.code === error.code && expected.range.start === error.range.start
        && expected.range.end === error.range.end;
}
