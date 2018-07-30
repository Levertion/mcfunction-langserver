import { AssertionError, equal, strictEqual } from "assert";
import { CommandError } from "../brigadier/errors";
import { StringReader } from "../brigadier/string-reader";
import { NamespacedName } from "../data/types";
import { isSuccessful, namespacesEqual } from "../misc-functions";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import {
    CE,
    ContextChange,
    Parser,
    ParserInfo,
    ReturnedInfo,
    ReturnSuccess,
    SubAction,
    SuggestResult
} from "../types";
import { blankproperties } from "./blanks";

export type TestParserInfo = Pick<
    ParserInfo,
    "context" | "data" | "node_properties" | "path"
>;

export const testParser = (parser: Parser) => (
    data: Partial<TestParserInfo> = {}
) => (
    text: string,
    expected: ReturnAssertionInfo
): [ReturnedInfo<ContextChange | undefined>, StringReader] => {
    let cursorPos: number;
    {
        const reader = new StringReader(text);
        const result = parser.parse(reader, {
            ...blankproperties,
            ...data,
            suggesting: true
        });
        returnAssert(result, {
            start: expected.start,
            succeeds: expected.succeeds,
            suggestions: expected.suggestions
        }); // There should be no non-suggestions when suggesting
        cursorPos = reader.cursor;
    }
    {
        const reader = new StringReader(text);
        const result = parser.parse(reader, {
            ...blankproperties,
            ...data,
            suggesting: false
        });
        returnAssert(result, { ...expected, suggestions: [] }); // There should be no suggestions when not suggesting
        equal(reader.cursor, cursorPos);
        return [result, reader];
    }
};

export interface ReturnAssertionInfo {
    actions?: SubAction[];
    errors?: ErrorInfo[];
    numActions?: number;
    numMisc?: number;
    start?: number;
    succeeds: boolean;
    suggestions?: SuggestedOption[];
}

export function returnAssert<T>(
    actual: ReturnedInfo<T, CE, any>,
    {
        errors = [],
        numActions = 0,
        numMisc = 0,
        start = 0,
        succeeds,
        suggestions = [],
        actions
    }: ReturnAssertionInfo
): actual is ReturnSuccess<T> {
    if (isSuccessful(actual) === succeeds) {
        assertErrors(errors, actual.errors);
        assertSuggestions(suggestions, actual.suggestions, start);
        if (actions) {
            assertMembers(actual.actions, actions, (expected, real) =>
                typed_keys(expected).every(k => real[k] === expected[k])
            );
        } else {
            strictEqual(actual.actions.length, numActions);
        }
        strictEqual(actual.misc.length, numMisc);
    } else {
        throw new AssertionError({
            message: `Expected value given to ${
                succeeds ? "succeed" : "fail"
            }, but it didn't. Value is: '${JSON.stringify(actual)}'`
        });
    }
    return true;
}

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
 * @param actual The actual errors
 */
export function assertErrors(
    expected: ErrorInfo[],
    actual: CommandError[] | undefined
): void {
    assertMembers(
        actual,
        expected,
        errorMatches,
        info =>
            `Expected errors to contain an error with code '${
                info.code
            }' and range ${info.range.start}...${
                info.range.end
            }, but none met this. The errors were ${JSON.stringify(actual)}`
    );
}

function errorMatches(error: CommandError, expected: ErrorInfo): boolean {
    return (
        expected.code === error.code &&
        expected.range.start === error.range.start &&
        expected.range.end === error.range.end
    );
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
    assertMembers(
        actual,
        expected,
        (suggestion, expectation) => {
            const [startText, position]: [string, number] =
                typeof expectation === "string"
                    ? [expectation, start]
                    : [expectation.text, expectation.start];
            if (typeof suggestion === "string") {
                return position === 0 && suggestion === startText;
            } else {
                return (
                    suggestion.text === startText &&
                    suggestion.start === position
                );
            }
        },
        expectation => {
            const [startText, position]: [string, number] =
                typeof expectation === "string"
                    ? [expectation, start]
                    : [expectation.text, expectation.start];
            return `Expected suggestions to contain a suggestion starting with text '${startText}' at position ${position}, but this was not found: got ${JSON.stringify(
                actual
            )} instead`;
        }
    );
}

export function assertNamespaces(
    expected: NamespacedName[],
    actual: NamespacedName[] | undefined
): void {
    assertMembers(
        actual,
        expected,
        namespacesEqual,
        expectation =>
            `Expected to find a path with namespace '${
                expectation.namespace
            }' and path ${expectation.path}, but none matched`
    );
}

/* 
export function assertReturn<T>(
    val: ReturnedInfo<T, CE, any>,
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
 */
export function unwrap<T>(val: T | undefined): T {
    if (val === undefined) {
        throw new AssertionError({
            actual: val,
            message: "Expected value to be defined"
        });
    }
    return val;
}

export function assertMembers<T, U>(
    actual: T[] | undefined,
    expected: U[],
    func: (v1: T, v2: U) => boolean,
    name: (val: U) => string = v => `Expected member for '${JSON.stringify(v)}'`
): void {
    if (typeof actual !== "undefined") {
        strictEqual(
            actual.length,
            expected.length,
            `Expected ${expected.length} members, got ${
                actual.length
            }: '${JSON.stringify(actual)}'`
        );
        outer: for (const member of expected) {
            for (const toTest of actual) {
                if (func(toTest, member)) {
                    continue outer;
                }
            }
            throw new AssertionError({ message: name(member) });
        }
    } else {
        if (expected.length !== 0) {
            throw new AssertionError({
                message: `Expected array with ${
                    expected.length
                } members, got undefined`
            });
        }
    }
}
