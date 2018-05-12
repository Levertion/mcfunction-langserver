import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import * as stringArgumentParser from "../../../../parse/parsers/brigadier/string";
import { CommmandData, ParserInfo } from "../../../../types";

describe("String Argument Parser", () => {
    describe("parse()", () => {
        describe("Greedy string", () => {
            const properties: ParserInfo = {
                data: {} as CommmandData, key: "test", node_properties: { type: "greedy" },
            };
            it("should read to the end of the string", () => {
                const reader = new StringReader("test space :\"-)(*");
                assert.doesNotThrow(() => stringArgumentParser.parse(reader, properties));
                assert.equal(reader.cursor, 17);
            });
        });
        describe("Phrase String", () => {
            const properties: ParserInfo = {
                data: {} as CommmandData, key: "test", node_properties: { type: "phrase" },
            };
            it("should read an unquoted string section", () => {
                const reader = new StringReader("test space :\"-)(*");
                assert.doesNotThrow(() => stringArgumentParser.parse(reader, properties));
                assert.equal(reader.cursor, 4);
            });
            it("should read a quoted string section", () => {
                const reader = new StringReader("\"quote test\" :\"-)(*");
                assert.doesNotThrow(() => stringArgumentParser.parse(reader, properties));
                assert.equal(reader.cursor, 11);
            });
        });
        describe("Word String", () => {
            const properties: ParserInfo = { key: "test", node_properties: { type: "word" }, data: {} as CommmandData };
            it("should read only an unquoted string section", () => {
                const reader = new StringReader("test space :\"-)(*");
                assert.doesNotThrow(() => stringArgumentParser.parse(reader, properties));
                assert.equal(reader.cursor, 4);
            });
            it("should not read a quoted string section", () => {
                const reader = new StringReader("\"quote test\" :\"-)(*");
                assert.doesNotThrow(() => stringArgumentParser.parse(reader, properties));
                assert.equal(reader.cursor, 0);
            });
        });
    });
    describe("getSuggestions()", () => {
        it("should not give any suggestions", () => {
            const properties: ParserInfo = {
                data: {} as CommmandData, key: "test", node_properties: { type: "greedy" },
            };
            assert.deepEqual(stringArgumentParser.getSuggestions("false", properties), []);
        });
    });
});
