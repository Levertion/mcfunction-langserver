import * as assert from "assert";
import { doubleParser } from "../../../parsers/brigadier/double";
import { testParser } from "../../assertions";
import { blankproperties } from "../../blanks";

const doubleTester = testParser(doubleParser);
describe("Double Argument Parser", () => {
    function validDoubleTests(
        s: string,
        expectedNum: number,
        numEnd: number
    ): void {
        it("should succeed with no constraints", () => {
            const result = doubleTester(blankproperties)(s, {
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, numEnd);
        });
        it("should reject a number less than the minimum", () => {
            const result = doubleTester({
                ...blankproperties,
                node_properties: { min: expectedNum + 1 }
            })(s, {
                errors: [
                    {
                        code: "argument.double.low",
                        range: { start: 0, end: numEnd }
                    }
                ],
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, numEnd);
        });
        it("should reject a number more than the maximum", () => {
            const result = doubleTester({
                ...blankproperties,
                node_properties: {
                    max: expectedNum - 1
                }
            })(s, {
                errors: [
                    {
                        code: "argument.double.big",
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
        validDoubleTests("1234", 1234, 4);
    });
    describe("valid integer with space", () => {
        validDoubleTests("1234 ", 1234, 4);
    });
    describe("valid float with `.`", () => {
        validDoubleTests("1234.5678", 1234.5678, 9);
    });
    describe("valid float with `.` and space", () => {
        validDoubleTests("1234.5678 ", 1234.5678, 9);
    });
});
