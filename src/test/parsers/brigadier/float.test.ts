import { floatParser } from "../../../parsers/brigadier";
import { snapshot, testParser } from "../../assertions";

const floatTester = testParser(floatParser);
describe("Float Argument Parser", () => {
    function validFloatTests(s: string, expectedNum: number): void {
        it("should succeed with no constraints", () => {
            snapshot(floatTester(), s);
        });
        it("should reject a number less than the minimum", () => {
            snapshot(
                floatTester({
                    node_properties: { min: expectedNum + 1 }
                }),
                s
            );
        });
        it("should reject a number more than the maximum", () => {
            snapshot(
                floatTester({
                    node_properties: {
                        max: expectedNum - 1
                    }
                }),
                s
            );
        });
    }
    describe("valid integer", () => {
        validFloatTests("1234", 1234);
    });
    describe("valid integer with space", () => {
        validFloatTests("1234 ", 1234);
    });
    describe("valid float with `.`", () => {
        validFloatTests("1234.5678", 1234.5678);
    });
    describe("valid float with `.` and space", () => {
        validFloatTests("1234.5678 ", 1234.5678);
    });
    it("should fail when the number is bigger than the java maximum float", () => {
        snapshot(
            floatTester(),
            "1000000000000000000000000000000000000000000000000000000000000"
        );
    });
    it("should fail when the number is less than the java minimum float", () => {
        snapshot(
            floatTester(),
            "-1000000000000000000000000000000000000000000000000000000000000"
        );
    });
});
