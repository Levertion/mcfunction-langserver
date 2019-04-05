import { literalParser } from "../../parsers/literal";
import { snapshot, testParser } from "../assertions";

const literalTest = testParser(literalParser)({ path: ["test"] });

describe("Literal Argument Parser", () => {
    it("should correctly handle various input", () => {
        snapshot(literalTest, "test", "test ", "fail ", "tesnot", "tes");
    });
});
