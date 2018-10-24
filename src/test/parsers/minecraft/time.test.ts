import { timeParser } from "../../../parsers/minecraft/time";
import { testParser } from "../../assertions";

const test = testParser(timeParser)();

describe("time parser", () => {
    it("should allow a plain integer", () => {
        test("123", { succeeds: true, suggestions: ["t", "s", "d"], start: 3 });
    });
    it("should allow an integer number of ticks", () => {
        test("123t", { start: 3, succeeds: true, suggestions: ["t"] });
    });
    it("should allow an integer number of seconds", () => {
        test("123s", { start: 3, succeeds: true, suggestions: ["s"] });
    });
    it("should allow a nice float number of seconds", () => {
        test("0.5s", { start: 3, succeeds: true, suggestions: ["s"] });
    });
    it("should not allow a negative integer", () => {
        test("-123", {
            errors: [
                {
                    code: "argument.time.not_nonnegative_integer",
                    range: { start: 0, end: 4 }
                }
            ],
            start: 4,
            succeeds: true,
            suggestions: ["t", "s", "d"]
        });
    });
});
