import { intParser } from "../../../parsers/brigadier";
import { snapshot, testParser } from "../../assertions";

const integerTest = testParser(intParser);

describe("Integer Argument Parser", () => {
    function validIntTests(s: string, expectedNum: number): void {
        it("should succeed with an unconstrained value", () => {
            snapshot(integerTest(), s);
        });
        it("should fail with a value less than the minimum", () => {
            snapshot(
                integerTest({ node_properties: { min: expectedNum + 1 } }),
                s
            );
        });
        it("should fail with a value more than the maximum", () => {
            snapshot(
                integerTest({
                    node_properties: { max: expectedNum - 1 }
                }),
                s
            );
        });
    }
    describe("valid integer", () => {
        validIntTests("1234", 1234);
    });
    describe("valid integer with space", () => {
        validIntTests("1234 ", 1234);
    });
    it("should fail when the integer is bigger than the java max", () => {
        snapshot(integerTest(), "1000000000000000");
    });
    it("should fail when the integer is less than the java min", () => {
        snapshot(integerTest(), "-1000000000000000");
    });
    it("should fail when there is an invalid integer", () => {
        snapshot(integerTest(), "notint");
    });
});
