import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import * as integerArgumentParser from "../../../../parse/parsers/brigadier/integer";
import { CommmandData, ParserInfo } from "../../../../types";
import { thrownErrorAssertion } from "../utils/parser_test_utils";

const defaultProperties: ParserInfo = { key: "test", node_properties: {}, data: {} as CommmandData };

describe("Integer Argument Parser", () => {
    describe("parse", () => {
        function validIntTests(s: string, expectedNum: number, numEnd: number) {
            describe("no constraints", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    data: {} as CommmandData,
                    key: "test",
                    node_properties: {},
                };
                it("should succeed", () => {
                    assert.doesNotThrow(() => integerArgumentParser.parse(reader, properties));
                    assert.equal(reader.cursor, numEnd);
                });
            });
            describe("less than min", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    data: {} as CommmandData,
                    key: "test", node_properties: { min: expectedNum + 1 },
                };
                it("should not succeed", () => {
                    assert.throws(() => {
                        integerArgumentParser.parse(reader, properties);
                    }, thrownErrorAssertion({ code: "argument.integer.low", range: { start: 0, end: numEnd } }));
                });
            });
            describe("more than max", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    data: {} as CommmandData,
                    key: "test", node_properties: { max: expectedNum - 1 },
                };
                it("should not suceed", () => {
                    assert.throws(() => { integerArgumentParser.parse(reader, properties); },
                        thrownErrorAssertion({ code: "argument.integer.big", range: { start: 0, end: numEnd } }),
                    );
                });
            });
        }
        describe("valid integer", () => {
            validIntTests("1234", 1234, 4);
        });
        describe("valid integer with space", () => {
            validIntTests("1234 ", 1234, 4);
        });
        describe("java max value testing ", () => {
            it("should throw an integer too big error", () => {
                const reader = new StringReader("1000000000000000");
                assert.throws(() => integerArgumentParser.parse(reader, defaultProperties),
                    thrownErrorAssertion({ code: "argument.integer.big", range: { start: 0, end: 16 } }),
                );
            });
        });
        describe("java min value testing ", () => {
            it("should throw an integer too small error", () => {
                const reader = new StringReader("-1000000000000000");
                assert.throws(() => integerArgumentParser.parse(reader, defaultProperties),
                    thrownErrorAssertion({ code: "argument.integer.low", range: { start: 0, end: 17 } }),
                );
            });
        });
        describe("getSuggestions()", () => {
            it("should not give any suggestions", () => {
                assert.deepEqual(integerArgumentParser.getSuggestions("false", defaultProperties), []);
            });
        });
    });
});
