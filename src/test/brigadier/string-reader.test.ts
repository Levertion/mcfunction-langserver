import * as assert from "assert";

import { StringReader } from "../../brigadier/string-reader";
import { snapshot } from "../assertions";

describe("string-reader", () => {
    describe("constructor()", () => {
        it("should create a reader with a the given string", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.string, "test");
        });
        it("should create a reader with cursor at the start", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.cursor, 0);
        });
    });
    describe("getRemainingLength()", () => {
        it("should give the full length of the string when the cursor is at the start", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.getRemainingLength(), 4);
        });
        it("should give zero when the cursor is at the end", () => {
            const reader = new StringReader("test");
            reader.cursor = 4;
            assert.strictEqual(reader.getRemainingLength(), 0);
        });
    });
    describe("getRead()", () => {
        it("should give nothing when the cursor is at the start", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.getRead(), "");
        });
        it("should give the full string when the cursor is at the end", () => {
            const reader = new StringReader("test");
            reader.cursor = 4;
            assert.strictEqual(reader.getRead(), "test");
        });
    });
    describe("getRemaining()", () => {
        it("should give the full text when the cursor is at the start", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.getRemaining(), "test");
        });
        it("should give an empty string when the cursor is almost at the end", () => {
            const reader = new StringReader("test");
            reader.cursor = 4;
            assert.strictEqual(reader.getRemaining(), "");
        });
    });
    describe("canRead()", () => {
        let reader: StringReader;
        beforeEach(() => {
            reader = new StringReader("test");
        });
        describe("without an input", () => {
            // Note that this should technically always be the case
            // Since the reader does not support being created with an empty string
            it("should return true when the cursor is at the start", () => {
                assert.strictEqual(reader.canRead(), true);
            });
            it("should return false when the cursor is at the end of the string", () => {
                reader.cursor = 4;
                assert.strictEqual(reader.canRead(), false);
            });
            it("should return true when the cursor is at the second to last character", () => {
                reader.cursor = 3;
                assert.strictEqual(reader.canRead(), true);
            });
            it("should return true when the cursor is not at the end of the string", () => {
                reader.cursor = 2;
                assert.strictEqual(reader.canRead(), true);
            });
        });
        describe("with input", () => {
            it("should return true with an input where it can read to", () => {
                assert.strictEqual(reader.canRead(3), true);
                assert.strictEqual(reader.canRead(2), true);
                assert.strictEqual(reader.canRead(1), true);
                reader.skip();
                assert.strictEqual(reader.canRead(2), true);
                assert.strictEqual(reader.canRead(1), true);
                reader.skip();
                assert.strictEqual(reader.canRead(1), true);
            });
            it("should return false with an input where it can't read to", () => {
                assert.strictEqual(reader.canRead(5), false);
                reader.skip();
                assert.strictEqual(reader.canRead(4), false);
                reader.skip();
                assert.strictEqual(reader.canRead(3), false);
            });
        });
    });
    describe("peek()", () => {
        it("should give the first character at the start", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.peek(), "t");
        });
        it("should give the second character from the second character", () => {
            const reader = new StringReader("test");
            reader.skip();
            assert.strictEqual(reader.peek(), "e");
        });
        it("should give the last character from the last character", () => {
            const reader = new StringReader("test");
            reader.cursor = 3;
            assert.strictEqual(reader.peek(), "t");
        });
        it("should give the character that many spaces in front when given an input", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.peek(1), "e");
            assert.strictEqual(reader.peek(2), "s");
            assert.strictEqual(reader.peek(3), "t");
        });
        // Note that this is inconsistent with Brigadier, which would throw an error
        // However it is assumed that all parsers will match this.
        it("should return an empty string if it is out of range", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.peek(4), "");
        });
    });
    describe("read()", () => {
        let reader: StringReader;
        beforeEach(() => {
            reader = new StringReader("test");
        });
        it("should give the first character at the start", () => {
            assert.strictEqual(reader.read(), "t");
            assert.strictEqual(reader.cursor, 1);
        });
        it("should give the second character from the second character", () => {
            reader.skip();
            assert.strictEqual(reader.read(), "e");
            assert.strictEqual(reader.cursor, 2);
        });
        it("should give the full string during subsequent reads", () => {
            ["t", "e", "s", "t"].forEach((char: string) => {
                assert.strictEqual(reader.read(), char);
            });
        });
    });
    describe("skip()", () => {
        let reader: StringReader;
        beforeEach(() => {
            reader = new StringReader("test");
        });
        it("should increase the cursor by one", () => {
            reader.skip();
            assert.strictEqual(reader.cursor, 1);
        });
    });
    describe("skipWhitespace", () => {
        it("should skip spaces at the start", () => {
            const reader = new StringReader("   threespaces");
            reader.skipWhitespace();
            assert.strictEqual(reader.cursor, 3);
        });
        it("should skip tabs at the start", () => {
            const reader = new StringReader("\t\t\tthreetabs");
            reader.skipWhitespace();
            assert.strictEqual(reader.cursor, 3);
        });
        it("should skip spaces at the end", () => {
            const reader = new StringReader("test   ");
            reader.cursor = 4;
            reader.skipWhitespace();
            assert.strictEqual(reader.cursor, 7);
        });
        it("should do nothing when the cursor is within a string", () => {
            const reader = new StringReader("nowhitespace");
            reader.skipWhitespace();
            assert.strictEqual(reader.cursor, 0);
        });
    });
    describe("readInt()", () => {
        it("should have the correct behaviour for various inputs", () => {
            snapshot(
                (text: string) => new StringReader(text).readInt(),
                "1000.",
                "-1000",
                "1000test",
                "noint",
                "1.",
                // Test integers of lengths up to 5
                ...[1, 2, 3, 4, 5].map(val =>
                    Array<number>(val)
                        .fill(1)
                        .map((_, i) => i)
                        .join("")
                )
            );
        });
    });
    describe("readFloat()", () => {
        it("should have the correct behaviour for various inputs", () => {
            snapshot(
                (text: string) => new StringReader(text).readInt(),
                "-1000",
                "1000.",
                "1000test",
                "noint",
                "1.",
                "1000.123",
                "-1000.123",
                "1000.123test",
                "nofloat",
                "1.1.1.1.1",
                // Test integers of lengths up to 5
                ...[1, 2, 3, 4, 5].map(val =>
                    Array<number>(val)
                        .fill(1)
                        .map((_, i) => i)
                        .join("")
                )
            );
        });
    });
    describe("readUnquotedString()", () => {
        it("should read the correct string", () => {
            const reader = new StringReader("hello");
            assert.strictEqual(reader.readUnquotedString(), "hello");
        });
        it("should only read the characters allowed in a string", () => {
            const reader = new StringReader("hello ");
            assert.strictEqual(reader.readUnquotedString(), "hello");
        });
        it("should not read any of the characters not allowed in an unquoted string", () => {
            const reader = new StringReader('*&^$%£!"');
            for (const _ of reader.string) {
                assert.strictEqual(reader.readUnquotedString(), "");
                reader.cursor++;
            }
        });
    });
    describe("readQuotedString()", () => {
        it("should have the correct behaviour on various inputs", () => {
            snapshot(
                (text: string) => new StringReader(text).readQuotedString(),
                "test",
                ...[
                    '"hello"',
                    '""',
                    '"quote\\"here"',
                    '"backslash\\\\here"',
                    '"oop\\s"',
                    '"trailing'
                ]
                    // Same tests with single quotes and with double quotes
                    .map(v => [v, v.replace('"', "'")])
                    .reduce((acc, val) => acc.concat(val), []),
                // Mixed quotes
                "'quote\" in the middle'",
                '"quote\' in the middle"'
            );
        });
        it("should return an empty string if it reading from the end", () => {
            const reader = new StringReader("test");
            reader.cursor = 4;
            snapshot(reader.readQuotedString());
        });
    });
    describe("readString()", () => {
        it("should use readQuotedString if it starts with a quote", () => {
            const reader = new StringReader('"test"');
            assert.strictEqual(reader.readString().data, "test");
        });
        it("should use readUnquotedString if it doesn't start with a quote", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.readString().data, "test");
        });
    });
    describe("readBoolean()", () => {
        it("should work correctly for various inputs", () => {
            snapshot(
                (text: string) => new StringReader(text).readBoolean(),
                "true",
                "false",
                "nonBoolean"
            );
        });
    });
    describe("expect()", () => {
        it("should work correctly for various inputs", () => {
            snapshot(
                (text: string, expected: string) =>
                    new StringReader(text).expect(expected),
                ["test", "t"],
                ["test", "n"],
                ["test", "tes"],
                ["test", "not"],
                ["te", "test"]
            );
        });
    });
    describe("readOption", () => {
        it("should work correctly for various inputs", () => {
            snapshot(
                (text: string, options: string[]) =>
                    new StringReader(text).expectOption(...options),
                ["test", ["test", "other"]],
                ["test", ["nottest", "other"]]
            );
        });
    });
    describe("readWhileFunction()", () => {
        it("should not read the first character if the callback fails on it", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.readWhileFunction(() => false), "");
            assert.strictEqual(reader.cursor, 0);
        });
        it("should read the rest of the string if the callback keeps returning true", () => {
            const reader = new StringReader("test");
            assert.strictEqual(reader.readWhileFunction(() => true), "test");
            assert.strictEqual(reader.cursor, 4);
        });
        it("should end on the first character not to get a true", () => {
            const reader = new StringReader("test");
            assert.strictEqual(
                reader.readWhileFunction((s: string) => s !== "s"),
                "te"
            );
            assert.strictEqual(reader.cursor, 2);
        });
    });
    describe("readWhileRegexp()", () => {
        it("should only read while the regex matches", () => {
            const reader = new StringReader("tetest");
            assert.strictEqual(reader.readWhileRegexp(/[te]/), "tete");
            assert.strictEqual(reader.cursor, 4);
        });
    });
    describe("readUntilRegexp()", () => {
        it("should only read until the regex matches, and not read the first which doesn't", () => {
            const reader = new StringReader("tetest");
            assert.strictEqual(reader.readUntilRegexp(/s/), "tete");
            assert.strictEqual(reader.cursor, 4);
        });
    });
});
