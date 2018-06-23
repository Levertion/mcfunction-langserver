import * as assert from "assert";
import { StringReader } from "../../brigadier_components/string_reader";
import * as literalArgumentParser from "../../parsers/literal";
import { ParserInfo } from "../../types";
import { assertReturn, defined } from "../assertions";

describe("literalArgumentParser", () => {
    const properties: ParserInfo = ({
        node_properties: {},
        path: ["test"],
        suggesting: true
    } as any) as ParserInfo;
    describe("parse()", () => {
        describe("literal correct", () => {
            it("should succeed, suggesting the string", () => {
                const reader = new StringReader("test");
                assertReturn(
                    defined(literalArgumentParser.parse(reader, properties)),
                    true,
                    [],
                    ["test"],
                    1
                );
                assert.strictEqual(reader.cursor, 4);
            });
            it("should set the cursor to after the string when it doesn't reach the end", () => {
                const reader = new StringReader("test ");
                assertReturn(
                    defined(literalArgumentParser.parse(reader, properties)),
                    true,
                    [],
                    [],
                    1
                );
                assert.strictEqual(reader.cursor, 4);
            });
            it("should return the correct highlight data", () => {
                const reader = new StringReader("test");
                const out = literalArgumentParser.parse(reader, properties);
                assert.deepStrictEqual(
                    out.actions.filter(v => v.type === "highlight"),
                    [
                        {
                            data: {
                                end: 4,
                                scopes: ["argument", "literal"],
                                start: 0
                            },
                            high: 4,
                            low: 0,
                            type: "highlight"
                        }
                    ]
                );
            });
        });
        describe("literal not matching", () => {
            it("should fail when the first character doesn't match", () => {
                const reader = new StringReader("nottest");
                assertReturn(
                    defined(literalArgumentParser.parse(reader, properties)),
                    false
                );
            });
            it("should throw an error when the last character doesn't match", () => {
                const reader = new StringReader("tesnot");
                assertReturn(
                    defined(literalArgumentParser.parse(reader, properties)),
                    false
                );
            });
            it("should suggest the string if the start is given", () => {
                const reader = new StringReader("tes");
                assertReturn(
                    defined(literalArgumentParser.parse(reader, properties)),
                    false,
                    [],
                    ["test"]
                );
            });
        });
    });
});
