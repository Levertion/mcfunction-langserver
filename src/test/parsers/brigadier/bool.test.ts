import { boolParser } from "../../../parsers/brigadier";
import { snapshot, testParser } from "../../assertions";

const boolTester = testParser(boolParser)();

describe("Boolean Argument Parser", () => {
    it("should work correctly for various inputs", () => {
        snapshot(boolTester, "true", "false", "notbool", "fal", "tru", "");
    });
});
