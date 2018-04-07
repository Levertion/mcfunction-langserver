import { AssertionError } from "assert";
import { CommandError, isCommandError } from "../../../../brigadier_components/errors";
import { SuggestResult } from "../../../../types";

export interface ErrorInfo {
    range: {
        start: number,
        end: number,
    };
    code: string;
}

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

export function assertSuggestions(expected: string[], start: number, actual: SuggestResult[] | undefined) {
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
            const index = actual.findIndex((v) => {
                if (typeof v === "string") {
                    return start === 0 && v === expectation;
                } else {
                    return v.value === expectation && v.start === start;
                }
            });
            if (index === -1) {
                throw new AssertionError({
                    message: `Expected suggestions to contain a suggestion starting with '${expectation
                        }', but got ${JSON.stringify(actual)}`,
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
