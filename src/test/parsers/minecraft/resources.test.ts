import * as resourceParsers from "../../../parsers/minecraft/resources";
import { convertToResource, testParser } from "../../assertions";

const functionTester = testParser(resourceParsers.functionParser)({
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
    it("should accept a known function", () => {
        functionTester("minecraft:test", {
            succeeds: true,
            suggestions: ["minecraft:test", "minecraft:test2"]
        });
    });
    it("should give an error for an unknown function", () => {
        functionTester("minecraft:unknown", {
            errors: [
                {
                    code: "arguments.function.unknown",
                    range: { start: 0, end: 17 }
                }
            ],
            succeeds: true
        });
    });
    it("should allow a known tag", () => {
        functionTester("#minecraft:tag", {
            succeeds: true,
            suggestions: [{ start: 1, text: "minecraft:tag" }]
        });
    });
    it("should give an error for an unknown tag", () => {
        functionTester("#minecraft:unknowntag", {
            errors: [
                {
                    code: "arguments.function.tag.unknown",
                    range: { start: 0, end: 21 }
                }
            ],
            succeeds: true
        });
    });
});
