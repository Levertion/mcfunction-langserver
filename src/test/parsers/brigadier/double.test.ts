import { doubleParser } from "../../../parsers/brigadier/double";
import { snapshot, testParser } from "../../assertions";
import { blankproperties } from "../../blanks";

const doubleTester = testParser(doubleParser);
describe("Double Argument Parser", () => {
    function validDoubleTests(s: string, expectedNum: number): void {
        it("should succeed with no constraints", () => {
            snapshot(doubleTester(blankproperties), s);
        });
        it("should reject a number less than the minimum", () => {
            snapshot(
                doubleTester({
                    ...blankproperties,
                    node_properties: { min: expectedNum + 1 }
                }),
                s
            );
        });
        it("should reject a number more than the maximum", () => {
            snapshot(
                doubleTester({
                    ...blankproperties,
                    node_properties: {
                        max: expectedNum - 1
                    }
                }),
                s
            );
        });
    }
    describe("valid integer", () => {
        validDoubleTests("1234", 1234);
    });
    describe("valid integer with space", () => {
        validDoubleTests("1234 ", 1234);
    });
    describe("valid float with `.`", () => {
        validDoubleTests("1234.5678", 1234.5678);
    });
    describe("valid float with `.` and space", () => {
        validDoubleTests("1234.5678 ", 1234.5678);
    });
});
