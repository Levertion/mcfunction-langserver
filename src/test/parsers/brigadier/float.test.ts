import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import * as floatArgumentParser from "../../../parsers/brigadier/float";
import { CommmandData, ParserInfo } from "../../../types";
import { assertReturn, defined } from "../../assertions";

describe("Float Argument Parser", () => {
    describe("parse()", () => {
        function validFloatTests(
            s: string,
            expectedNum: number,
            numEnd: number
        ): void {
            it("should succeed with no constraints", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    context: {},
                    data: {} as CommmandData,
                    node_properties: {},
                    path: ["test"],
                    suggesting: true
                };
                const result = floatArgumentParser.parse(reader, properties);
                assertReturn(defined(result), true);
                assert.strictEqual(reader.cursor, numEnd);
            });
            it("should reject a number less than the minimum", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    context: {},
                    data: {} as CommmandData,
                    node_properties: { min: expectedNum + 1 },
                    path: ["test"],
                    suggesting: true
                };
                const result = floatArgumentParser.parse(reader, properties);
                assertReturn(defined(result), false, [
                    {
                        code: "argument.float.low",
                        range: { start: 0, end: numEnd }
                    }
                ]);
            });
            it("should reject a number more than the maximum", () => {
                const reader = new StringReader(s);
                const properties: ParserInfo = {
                    context: {},
                    data: {} as CommmandData,
                    node_properties: { max: expectedNum - 1 },
                    path: ["test"],
                    suggesting: true
                };
                const result = floatArgumentParser.parse(reader, properties);
                assertReturn(defined(result), false, [
                    {
                        code: "argument.float.big",
                        range: { start: 0, end: numEnd }
                    }
                ]);
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
                context: {},
                data: {} as CommmandData,
                node_properties: {},
                path: ["test"],
                suggesting: true
            };
            const result = floatArgumentParser.parse(reader, properties);
            assertReturn(defined(result), false, [
                { code: "argument.float.big", range: { start: 0, end: 16 } }
            ]);
        });
        it("should fail when the number is less than the java minimum float", () => {
            const reader = new StringReader("-1000000000000000");
            const properties: ParserInfo = {
                context: {},
                data: {} as CommmandData,
                node_properties: {},
                path: ["test"],
                suggesting: true
            };
            const result = floatArgumentParser.parse(reader, properties);
            assertReturn(defined(result), false, [
                { code: "argument.float.low", range: { start: 0, end: 17 } }
            ]);
        });
    });
});
