import * as assert from "assert";
import * as floatArgumentParser from "../../../parsers/brigadier/float";
import { testParser } from "../../assertions";
import { blankproperties } from "../../blanks";

const floatTester = testParser(floatArgumentParser);
describe("Float Argument Parser", () => {
    function validFloatTests(
        s: string,
        expectedNum: number,
        numEnd: number
    ): void {
        it("should succeed with no constraints", () => {
            const result = floatTester(blankproperties)(s, {
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, numEnd);
        });
        it("should reject a number less than the minimum", () => {
            const result = floatTester({
                ...blankproperties,
                node_properties: { min: expectedNum + 1 }
            })(s, {
                errors: [
                    {
                        code: "argument.float.low",
                        range: { start: 0, end: numEnd }
                    }
                ],
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, numEnd);
        });
        it("should reject a number more than the maximum", () => {
            const result = floatTester({
                ...blankproperties,
                node_properties: {
                    max: expectedNum - 1
                }
            })(s, {
                errors: [
                    {
                        code: "argument.float.big",
                        range: {
                            end: numEnd,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, numEnd);
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
        floatTester(blankproperties)("1000000000000000", {
            errors: [
                {
                    code: "argument.float.big",
                    range: { start: 0, end: 16 }
                }
            ],
            succeeds: true
        });
    });
    it("should fail when the number is less than the java minimum float", () => {
        floatTester(blankproperties)("-1000000000000000", {
            errors: [
                {
                    code: "argument.float.low",
                    range: { start: 0, end: 17 }
                }
            ],
            succeeds: true
        });
    });
});
