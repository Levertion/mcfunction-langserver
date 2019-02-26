import * as assert from "assert";

import { intParser } from "../../../parsers/brigadier";
import { testParser } from "../../assertions";

const integerTest = testParser(intParser);

describe("Integer Argument Parser", () => {
    function validIntTests(
        s: string,
        expectedNum: number,
        numEnd: number
    ): void {
        it("should succeed with an unconstrained value", () => {
            const result = integerTest()(s, {
                succeeds: true
            });
            assert.strictEqual(result[1].cursor, numEnd);
        });
        it("should fail with a value less than the minimum", () => {
            integerTest({
                node_properties: { min: expectedNum + 1 }
            })(s, {
                errors: [
                    {
                        code: "argument.integer.low",
                        range: { start: 0, end: numEnd }
                    }
                ],
                succeeds: true
            });
        });
        it("should fail with a value more than the maximum", () => {
            integerTest({
                node_properties: { max: expectedNum - 1 }
            })(s, {
                errors: [
                    {
                        code: "argument.integer.big",
                        range: { start: 0, end: numEnd }
                    }
                ],
                succeeds: true
            });
        });
    }
    describe("valid integer", () => {
        validIntTests("1234", 1234, 4);
    });
    describe("valid integer with space", () => {
        validIntTests("1234 ", 1234, 4);
    });
    it("should fail when the integer is bigger than the java max", () => {
        integerTest()("1000000000000000", {
            errors: [
                {
                    code: "argument.integer.big",
                    range: { start: 0, end: 16 }
                }
            ],
            succeeds: true
        });
    });
    it("should fail when the integer is less than the java min", () => {
        integerTest()("-1000000000000000", {
            errors: [
                {
                    code: "argument.integer.low",
                    range: { start: 0, end: 17 }
                }
            ],
            succeeds: true
        });
    });
    it("should fail when there is an invalid integer", () => {
        integerTest()("notint", {
            errors: [
                { code: "parsing.int.expected", range: { start: 0, end: 6 } }
            ],
            succeeds: false
        });
    });
});
