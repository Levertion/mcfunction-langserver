import { timeParser } from "../../../parsers/minecraft/time";
import { testParser } from "../../assertions";

const test = testParser(timeParser)();

describe("time parser", () => {
    it("should allow a plain integer", () => {
        test("123");
    });
    it("should allow an integer number of ticks", () => {
        test("123t");
    });
    it("should allow an integer number of seconds", () => {
        test("123s");
    });
    it("should allow a nice float number of seconds", () => {
        test("0.5s");
    });
    it("should not allow a negative integer", () => {
        test("-123");
    });
});
