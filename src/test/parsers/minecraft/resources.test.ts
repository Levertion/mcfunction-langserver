import * as resourceParsers from "../../../parsers/minecraft/resources";
import { convertToResource, snapshot, testParser } from "../../assertions";

const testFunction = testParser(resourceParsers.functionParser)({
    data: {
        globalData: {
            resources: {
                function_tags: [convertToResource("minecraft:tag")],
                functions: [
                    convertToResource("minecraft:test"),
                    convertToResource("minecraft:test2")
                ]
            }
        }
    }
} as any);

describe("function parser", () => {
    it("should have the correct behaviour for various inputs", () => {
        snapshot(
            testFunction,
            "minecraft:test",
            "minecraft:unknown",
            "#minecraft:tag",
            "#minecraft:unknowntag"
        );
    });
});
