import * as assert from "assert";

import { literalParser } from "../../parsers/literal";
import { testParser } from "../assertions";

const literalTest = testParser(literalParser)({ path: ["test"] });

describe("Literal Argument Parser", () => {
    describe("literal correct", () => {
        it("should succeed, suggesting the string", () => {
            const result = literalTest("test", {
                succeeds: true,
                suggestions: ["test"]
            });
            assert.strictEqual(result[1].cursor, 4);
        });
        it("should set the cursor to after the string when it doesn't reach the end", () => {
            const result = literalTest("test ", {
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, 4);
        });
    });
    describe("literal not matching", () => {
        it("should fail when the first character doesn't match", () => {
            literalTest("fail ", {
                succeeds: false
            });
        });
        it("should fail when the last character doesn't match", () => {
            literalTest("tesnot", {
                succeeds: false
            });
        });
        it("should suggest the string if the start is given", () => {
            literalTest("tes", {
                succeeds: false,
                suggestions: ["test"]
            });
        });
    });
});
