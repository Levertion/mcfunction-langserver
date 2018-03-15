import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import * as literalArgumentParser from "../../../parse/parsers/literal";
import { ParseResult, ParserInfo } from "../../../types";

describe("literalArgumentParser", () => {
    const properties: ParserInfo = { key: "test", node_properties: {} } as any as ParserInfo;
    describe("parse()", () => {
        describe("literal correct", () => {
            it("should suceed", () => {
                const reader = new StringReader("test");
                assert.deepEqual(literalArgumentParser.parse(reader, properties), {
                    highlight: [
                        {
                            end: 4,
                            scopes: ["literal"],
                            start: 0,
                        },
                    ],
                    successful: true,
                } as ParseResult);
            });
            it("should set the cursor to end of the string when the literal goes to the end of the string", () => {
                const reader = new StringReader("test");
                literalArgumentParser.parse(reader, properties);
                assert.equal(reader.cursor, 4);
            });
            it("should set the cursor to after the string when it doesn't reach the end", () => {
                const reader = new StringReader("test ");
                literalArgumentParser.parse(reader, properties);
                assert.equal(reader.cursor, 4);
            });
        });
        describe("literal not matching", () => {
            it("should fail when the first character doesn't mathc", () => {
                const reader = new StringReader("nottest");
                assert.deepEqual(literalArgumentParser.parse(reader, properties), { successful: false });
            });
            it("should throw an error when the last character doesn't match", () => {
                const reader = new StringReader("tesnot");
                assert.deepEqual(literalArgumentParser.parse(reader, properties), { successful: false });
            });
        });
    });
    describe("getSuggestions()", () => {
        it("should return the literal if it is given a valid start", () => {
            assert.deepEqual(literalArgumentParser.getSuggestions("tes", properties), ["test"]);
            assert.deepEqual(literalArgumentParser.getSuggestions("test", properties), ["test"]);
        });
        it("should give nothing if there is an invalid start", () => {
            assert.deepEqual(literalArgumentParser.getSuggestions("hello", properties), []);
            assert.deepEqual(literalArgumentParser.getSuggestions("nottest", properties), []);
        });
    });
});
