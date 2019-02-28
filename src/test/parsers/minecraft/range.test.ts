import { floatRange, intRange } from "../../../parsers/minecraft/range";
import { snapshot, testParser } from "../../assertions";

describe("range parser", () => {
    const intTests: string[] = ["10", "..34", "12..34", "..", "7..-12", "5..5"];
    describe("int range", () => {
        const tester = testParser(intRange)();
        it("should do the right thing for different inputs", () => {
            snapshot(tester, ...intTests);
        });
    });
    describe("float range", () => {
        const tester = testParser(floatRange)();
        it("should do the right thing for different inputs", () => {
            snapshot(tester, ...intTests, "9.32", "3.12..", "...4", "3.4..0.2");
        });
    });
});
