import {
    AssertionError,
    deepStrictEqual,
    notStrictEqual,
    strictEqual
} from "assert";
import * as snapshot from "snap-shot-it";

import { StringReader } from "../brigadier/string-reader";
import { NAMESPACE } from "../consts";
import { DataID, ResourceID } from "../data/types";
import { convertToID } from "../misc-functions";
import { ContextChange, Parser, ParserInfo, ReturnedInfo } from "../types";

import { blankproperties } from "./blanks";

// To allow for auto-import
export { snapshot };

export type TestParserInfo = Pick<
    ParserInfo,
    "context" | "data" | "node_properties" | "path"
>;

export interface ParserTestResult {
    cursor: number;
    parsing: ReturnedInfo<ContextChange | undefined>;
    suggesting: ReturnedInfo<ContextChange | undefined>;
}

export const testParser = (parser: Parser) => (
    data: Partial<TestParserInfo> = {}
) => {
    function runParsertest(
        text: string,
        startingPos: number = 0
    ): ParserTestResult {
        const reader = new StringReader(text);
        reader.cursor = startingPos;
        const suggesting = parser.parse(reader, {
            ...blankproperties,
            ...data,
            suggesting: true
        });
        const cursor = reader.cursor;
        reader.cursor = startingPos;
        const parsing = parser.parse(reader, {
            ...blankproperties,
            ...data,
            suggesting: false
        });
        strictEqual(reader.cursor, cursor);
        deepStrictEqual(parsing.suggestions, []);
        return { cursor, parsing, suggesting };
    }
    return runParsertest;
};

export const testFunction = <A extends any[], T>(
    func: (reader: StringReader, ...args: A) => T,
    ...args: A
) => (text: string, startingPos = 0) => {
    const reader = new StringReader(text);
    reader.cursor = startingPos;
    return func(reader, ...args);
};
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

/**
 * Helper function for definining resources
 */
export function convertToResource<T>(
    input: string,
    data?: T,
    splitChar: string = NAMESPACE
): DataID<T> {
    const result = convertToID(input, splitChar);
    notStrictEqual(result.namespace, undefined);
    if (data) {
        return { ...(result as ResourceID), data };
    }
    return result as ResourceID;
}
