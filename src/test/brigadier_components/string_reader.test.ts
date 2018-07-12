import * as assert from "assert";
import { StringReader } from "../../brigadier_components/string_reader";
import { returnAssert } from "../assertions";
import { succeeds } from "../blanks";

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
        [1, 2, 3, 4, 5].forEach((val: number) => {
            it(`should read a ${val} character long integer`, () => {
                const numbers = Array<number>(val)
                    .fill(1)
                    .map((_, i) => i);
                const reader = new StringReader(numbers.join(""));
                const result = reader.readInt();
                if (returnAssert(result, succeeds)) {
                    assert.strictEqual(
                        result.data,
                        Number.parseInt(numbers.join(""))
                    );
                }
            });
        });
        it("should read a negative integer", () => {
            const reader = new StringReader("-1000");
            const result = reader.readInt();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, -1000);
            }
        });
        it("should fail when there is a decimal place", () => {
            const reader = new StringReader("1000.");
            const result = reader.readInt();
            returnAssert(result, {
                errors: [
                    { code: "parsing.int.invalid", range: { start: 0, end: 5 } }
                ],
                succeeds: false
            });
        });
        it("should read an integer until the first non-integer value", () => {
            const reader = new StringReader("1000test");
            const result = reader.readInt();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, 1000);
            }
        });
        it("should throw an error when there is no integer under the cursor", () => {
            const reader = new StringReader("noint");
            const result = reader.readInt();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.int.expected",
                        range: { start: 0, end: 5 }
                    }
                ],
                succeeds: false
            });
        });
        it("should fail when there is an invalid int under the cursor", () => {
            const reader = new StringReader("1.");
            const result = reader.readInt();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.int.invalid",
                        range: {
                            end: 2,
                            start: 0
                        }
                    }
                ],
                succeeds: false
            });
        });
    });
    describe("readFloat()", () => {
        [1, 2, 3, 4, 5].forEach((val: number) => {
            it(`should read a ${val} character long integer`, () => {
                const numbers = Array<number>(val)
                    .fill(1)
                    .map(v => v + 1);
                const reader = new StringReader(numbers.join(""));
                const result = reader.readFloat();
                if (returnAssert(result, succeeds)) {
                    assert.strictEqual(
                        result.data,
                        Number.parseInt(numbers.join(""))
                    );
                }
            });
        });
        it("should read a negative integer", () => {
            const reader = new StringReader("-1000");
            const result = reader.readFloat();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, -1000);
            }
        });
        it("should return an integer even when there is a trailing decimal place", () => {
            const reader = new StringReader("1000.");
            const result = reader.readFloat();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, 1000);
            }
        });
        it("should read a float with a decimal place", () => {
            const reader = new StringReader("1000.123");
            const result = reader.readFloat();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, 1000.123);
            }
        });
        it("should read a negative float", () => {
            const reader = new StringReader("-1000.123");
            const result = reader.readFloat();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, -1000.123);
            }
        });
        it("should read a float until the first non-float value", () => {
            const reader = new StringReader("1000.123test");
            const result = reader.readFloat();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, 1000.123);
            }
            assert.strictEqual(reader.cursor, 8);
        });
        it("should fail when there is not a float under the cursor", () => {
            const reader = new StringReader("nofloat");
            const result = reader.readFloat();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.float.expected",
                        range: { start: 0, end: 7 }
                    }
                ],
                succeeds: false
            });
        });
        it("should fail when there is an invalid float under the cursor", () => {
            const reader = new StringReader("1.1.1.1.1");
            const result = reader.readFloat();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.float.invalid",
                        range: {
                            end: 9,
                            start: 0
                        }
                    }
                ],
                succeeds: false
            });
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
        it("should return an empty string if it reading from the end", () => {
            const reader = new StringReader("test");
            reader.cursor = 4;
            const result = reader.readQuotedString();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, "");
            }
        });
        it("should throw an error if there is no opening quote", () => {
            const reader = new StringReader("test");
            const result = reader.readQuotedString();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.quote.expected.start",
                        range: { start: 0, end: 4 }
                    }
                ],
                succeeds: false
            });
        });
        it("should read a full quoted string, giving a result without the quotes", () => {
            const reader = new StringReader('"hello"');
            const result = reader.readQuotedString();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, "hello");
            }
        });
        it("should return an empty string when there is an empty quoted string", () => {
            const reader = new StringReader('""');
            const result = reader.readQuotedString();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, "");
            }
        });
        it("should allow escaped quotes", () => {
            const reader = new StringReader('"quote\\"here"');
            const result = reader.readQuotedString();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, 'quote"here');
            }
        });
        it("should allow escaped backslashes", () => {
            const reader = new StringReader('"backslash\\\\here"');
            const result = reader.readQuotedString();
            if (returnAssert(result, succeeds)) {
                assert.strictEqual(result.data, "backslash\\here");
            }
        });
        it("should not allow surplus escapes", () => {
            const reader = new StringReader('"oop\\s"');
            const result = reader.readQuotedString();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.quote.escape", // Repeat of what Brigadier does?
                        range: { start: 4, end: 6 }
                    }
                ],
                succeeds: false
            });
        });
        it("should fail when there is no closing quote", () => {
            const reader = new StringReader('"trailing');
            const result = reader.readQuotedString();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.quote.expected.end",
                        range: { start: 0, end: 9 }
                    }
                ],
                succeeds: false,
                suggestions: [{ start: 9, text: '"' }]
            });
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
        it("should return true if the string is true", () => {
            const reader = new StringReader("true");
            const result = reader.readBoolean();
            if (
                returnAssert(result, { succeeds: true, suggestions: ["true"] })
            ) {
                assert.strictEqual(result.data, true);
            }
        });
        it("should return false if the string is false", () => {
            const reader = new StringReader("false");
            const result = reader.readBoolean();
            if (
                returnAssert(result, {
                    succeeds: true,
                    suggestions: ["false"]
                })
            ) {
                assert.strictEqual(result.data, false);
            }
        });
        it("should throw an error if not a boolean", () => {
            const reader = new StringReader("nonBoolean");
            const result = reader.readBoolean();
            returnAssert(result, {
                errors: [
                    {
                        code: "parsing.bool.invalid",
                        range: { start: 0, end: 10 }
                    }
                ],
                succeeds: false
            });
        });
    });
    describe("expect()", () => {
        it("should check the character under the cursor", () => {
            const reader = new StringReader("test");
            const result = reader.expect("t");
            returnAssert(result, succeeds);
            assert.strictEqual(reader.cursor, 1);
        });
        it("should not allow any other character", () => {
            const reader = new StringReader("test");
            const result = reader.expect("n");
            returnAssert(result, {
                errors: [
                    { code: "parsing.expected", range: { start: 0, end: 1 } }
                ],
                succeeds: false
            });
            assert.strictEqual(reader.cursor, 0);
        });
        it("should allow a multi character string", () => {
            const reader = new StringReader("test");
            const result = reader.expect("tes");
            returnAssert(result, succeeds);
            assert.strictEqual(reader.cursor, 3);
        });
        it("should not allow an incorrect multi-character string", () => {
            const reader = new StringReader("test");
            const result = reader.expect("not");
            returnAssert(result, {
                errors: [
                    { code: "parsing.expected", range: { start: 0, end: 3 } }
                ],
                succeeds: false
            });
            assert.strictEqual(reader.cursor, 0);
        });
        it("should give a suggestion of the string", () => {
            const reader = new StringReader("te");
            const result = reader.expect("test");
            returnAssert(result, {
                errors: [
                    { code: "parsing.expected", range: { start: 0, end: 2 } }
                ],
                succeeds: false,
                suggestions: [{ start: 0, text: "test" }]
            });
            assert.strictEqual(reader.cursor, 0);
        });
    });
    describe("readOption", () => {
        // TODO
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
