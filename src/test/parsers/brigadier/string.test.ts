import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import * as stringArgumentParser from "../../../parsers/brigadier/string";
import { ParserInfo } from "../../../types";
import { assertReturn, defined } from "../../assertions";

const defaultProperties: ParserInfo = {
    context: {},
    data: {} as any,
    node_properties: {},
    path: ["test"],
    suggesting: true
};

describe("String Argument Parser", () => {
    describe("parse()", () => {
        it("should read to the end with a greedy string", () => {
            const properties: ParserInfo = {
                ...defaultProperties,
                node_properties: { type: "greedy" }
            };
            const reader = new StringReader('test space :"-)(*');
            assertReturn(
                defined(stringArgumentParser.parse(reader, properties)),
                true
            );
            assert.strictEqual(reader.cursor, 17);
        });
        describe("Phrase String", () => {
            const properties: ParserInfo = {
                ...defaultProperties,
                node_properties: { type: "phrase" }
            };
            it("should read an unquoted string section", () => {
                const reader = new StringReader('test space :"-)(*');
                assertReturn(
                    defined(stringArgumentParser.parse(reader, properties)),
                    true
                );
                assert.strictEqual(reader.cursor, 4);
            });
            it("should read a quoted string section", () => {
                const reader = new StringReader('"quote test" :"-)(*');
                assertReturn(
                    defined(stringArgumentParser.parse(reader, properties)),
                    true
                );
                assert.strictEqual(reader.cursor, 11);
            });
        });
        describe("Word String", () => {
            const properties: ParserInfo = {
                ...defaultProperties,
                node_properties: { type: "word" }
            };
            it("should read only an unquoted string section", () => {
                const reader = new StringReader('test space :"-)(*');
                assertReturn(
                    defined(stringArgumentParser.parse(reader, properties)),
                    true
                );
                assert.strictEqual(reader.cursor, 4);
            });
            it("should not read a quoted string section", () => {
                const reader = new StringReader('"quote test" :"-)(*');
                assertReturn(
                    defined(stringArgumentParser.parse(reader, properties)),
                    true
                );
                assert.strictEqual(reader.cursor, 0);
            });
        });
    });
});
