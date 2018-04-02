import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import * as floatArgumentParser from "../../../../parse/parsers/brigadier/float";
import { CommmandData, ParserInfo } from "../../../../types";
import { thrownErrorAssertion } from "../utils/parser_test_utils";

describe("Float Argument Parser", () => {
    describe("parse()", () => {
        function validFloatTests(s: string, expectedNum: number, numEnd: number) {
            it("should succeed with no constraints", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = { data: {} as CommmandData, key: "test", node_properties: {} };
                assert.doesNotThrow(() => floatArgumentParser.parse(reader, properties));
                assert.equal(reader.cursor, numEnd);
            });
            it("should throw a valid command error when the value is less than the minimum", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    data: {} as CommmandData, key: "test",
                    node_properties: { min: expectedNum + 1 },
                };
                assert.throws(() => {
                    floatArgumentParser.parse(reader, properties);
                }, thrownErrorAssertion({ code: "argument.float.low", range: { start: 0, end: numEnd } }));
            });
            it("should throw a valid command error when it is more than the maximum", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    data: {} as CommmandData, key: "test", node_properties: { max: expectedNum - 1 },
                };
                assert.throws(() => { floatArgumentParser.parse(reader, properties); },
                    thrownErrorAssertion({ code: "argument.float.big", range: { start: 0, end: numEnd } }));
            });
        }
        describe("valid integer", () => {
            validFloatTests("1234", 1234, 4);
        });
        describe("valid integer with space", () => {
            validFloatTests("1234 ", 1234, 4);
        });
        describe("valid float with `.`", () => {
            validFloatTests("1234.5678", 1234.5678, 9);
        });
        describe("valid float with `.` and space", () => {
            validFloatTests("1234.5678 ", 1234.5678, 9);
        });
        it("should fail when the number is bigger than the java maximum float", () => {
            const reader = new StringReader("1000000000000000");
            const properties: ParserInfo = {
                data: {} as CommmandData, key: "test", node_properties: {},
            };
            assert.throws(() => {
                floatArgumentParser.parse(reader, properties);
            }, thrownErrorAssertion({ code: "argument.float.big", range: { start: 0, end: 16 } }));
        });
        it("should fail when the number is less than the java minimum float", () => {
            const reader = new StringReader("-1000000000000000");
            const properties: ParserInfo = {
                data: {} as CommmandData, key: "test", node_properties: {},
            };
            assert.throws(() => {
                floatArgumentParser.parse(reader, properties);
            }, thrownErrorAssertion({ code: "argument.float.low", range: { start: 0, end: 17 } }));
        });
    });
    describe("getSuggestions()", () => {
        it("should not give any suggestions", () => {
            const properties: ParserInfo = { key: "test", node_properties: {}, data: {} as CommmandData };
            assert.deepEqual(floatArgumentParser.getSuggestions("false", properties), []);
        });
    });
});
