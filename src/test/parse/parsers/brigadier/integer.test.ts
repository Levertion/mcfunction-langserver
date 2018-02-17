import * as assert from "assert";
import { isCommandError } from "../../../../brigadier_components/errors";
import { StringReader } from "../../../../brigadier_components/string_reader";
import * as integerArgumentParser from "../../../../parse/parsers/brigadier/integer";
import { CommmandData, ParserInfo } from "../../../../types";

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
                    }, (error: any) => isCommandError(error));
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
                        (error: any) => isCommandError(error));
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
            const reader = new StringReader("1000000000000000");
            const properties: ParserInfo = { key: "test", node_properties: {}, data: {} as CommmandData };
            it("should throw an integer too big error", () => {
                assert.throws(() => {
                    integerArgumentParser.parse(reader, properties);
                }, (error: any) => isCommandError(error));
            });
        });
        describe("java min value testing ", () => {
            const reader = new StringReader("-1000000000000000");
            const properties: ParserInfo = { key: "test", node_properties: {}, data: {} as CommmandData };
            it("should throw an integer too big error", () => {
                assert.throws(() => {
                    integerArgumentParser.parse(reader, properties);
                }, (error: any) => isCommandError(error));
            });
        });
    });
    describe("getSuggestions()", () => {
        it("should not give any suggestions", () => {
            const properties: ParserInfo = { key: "test", node_properties: {}, data: {} as CommmandData };
            assert.deepEqual(integerArgumentParser.getSuggestions("false", properties), []);
        });
    });
});
