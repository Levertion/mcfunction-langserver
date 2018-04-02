import { AssertionError } from "assert";
import { CommandError, isCommandError } from "../../../../brigadier_components/errors";

interface ErrorInfo {
    range: {
        start: number,
        end: number,
    };
    code: string;
}

export function assertErrors(expected: ErrorInfo[], realErrors: CommandError[]) {
    if (expected.length > realErrors.length) {
        throw new AssertionError({
            message: `Too many errors were given. Actual errors were: '${JSON.stringify(realErrors)}'`,
        });
    }
    if (expected.length < realErrors.length) {
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

function errorMatches(expected: ErrorInfo, error: CommandError): boolean {
    return expected.code === error.code && expected.range.start === error.range.start
        && expected.range.end === error.range.end;
}
