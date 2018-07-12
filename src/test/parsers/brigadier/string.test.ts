import * as assert from "assert";
import * as stringArgumentParser from "../../../parsers/brigadier/string";
import { testParser } from "../../assertions";
import { succeeds } from "../../blanks";

const stringTest = testParser(stringArgumentParser);

describe("String Argument Parser", () => {
    describe("parse()", () => {
        it("should read to the end with a greedy string", () => {
            const result = stringTest({
                node_properties: { type: "greedy" }
            })('test space :"-)(*', succeeds);
            assert.strictEqual(result[1].cursor, 17);
        });
        describe("Phrase String", () => {
            const tester = stringTest({ node_properties: { type: "phrase" } });
            it("should read an unquoted string section", () => {
                const result = tester('test space :"-)(*', succeeds);
                assert.strictEqual(result[1].cursor, 4);
            });
            it("should read a quoted string section", () => {
                const result = tester('"quote test" :"-)(*', succeeds);
                assert.strictEqual(result[1].cursor, 11);
            });
        });
        describe("Word String", () => {
            const tester = stringTest({ node_properties: { type: "word" } });
            it("should read only an unquoted string section", () => {
                const result = tester('test space :"-)(*', succeeds);
                assert.strictEqual(result[1].cursor, 4);
            });
            it("should not read a quoted string section", () => {
                const result = tester('"quote test" :"-)(*', succeeds);
                assert.strictEqual(result[1].cursor, 0);
            });
        });
    });
});
