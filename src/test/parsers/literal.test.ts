import * as assert from "assert";
import { StringReader } from "../../brigadier_components/string_reader";
import * as literalArgumentParser from "../../parsers/literal";
import { ParserInfo } from "../../types";
import { assertReturn, defined } from "../assertions";

describe("literalArgumentParser", () => {
    const properties: ParserInfo = { path: ["test"], node_properties: {}, suggesting: true } as any as ParserInfo;
    describe("parse()", () => {
        describe("literal correct", () => {
            it("should succeed, suggesting the string", () => {
                const reader = new StringReader("test");
                assertReturn(defined(literalArgumentParser.parse(reader, properties)), true, [], ["test"]);
                assert.equal(reader.cursor, 4);
            });
            it("should set the cursor to after the string when it doesn't reach the end", () => {
                const reader = new StringReader("test ");
                assertReturn(defined(literalArgumentParser.parse(reader, properties)), true, [], ["test"]);
                assert.equal(reader.cursor, 4);
            });
        });
        describe("literal not matching", () => {
            it("should fail when the first character doesn't match", () => {
                const reader = new StringReader("nottest");
                assertReturn(defined(literalArgumentParser.parse(reader, properties)), false);
            });
            it("should throw an error when the last character doesn't match", () => {
                const reader = new StringReader("tesnot");
                assertReturn(defined(literalArgumentParser.parse(reader, properties)), false);
            });
            it("should suggest the string if the start is given", () => {
                const reader = new StringReader("tes");
                assertReturn(defined(literalArgumentParser.parse(reader, properties)), false, [], ["test"]);
            });
        });
    });
});
