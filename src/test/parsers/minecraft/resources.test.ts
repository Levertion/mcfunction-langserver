import * as resourceParsers from "../../../parsers/minecraft/resources";
import { convertToResource, testParser } from "../../assertions";
import { succeeds } from "../../blanks";

const functionTester = testParser(resourceParsers.functionParser)({
    data: {
        globalData: {
            resources: {
                functions: [
                    convertToResource("minecraft:test"),
                    convertToResource("minecraft:test2")
                ]
            }
        }
    }
} as any);

describe("function parser", () => {
    it("should accept a known function", () => {
        functionTester("h", succeeds);
    });
});
