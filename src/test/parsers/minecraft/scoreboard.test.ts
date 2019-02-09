import { criteriaParser } from "../../../parsers/minecraft/scoreboard";
import { testParser } from "../../assertions";

describe("scoreboard parsers", () => {
    describe("criterion parser", () => {
        const test = testParser(criteriaParser)({
            data: {
                globalData: {
                    registries: {
                        "minecraft:custom_stat": new Set([
                            "minecraft:some_custom"
                        ]),
                        "minecraft:item": new Set([
                            "minecraft:some_item",
                            "minecraft:some_other_item"
                        ])
                    }
                }
            } as any
        });
        it("should support parsing a simple criteria", () => {
            test("air", { succeeds: true, suggestions: ["air"] });
        });
        it("should support a color requiring criterion", () => {
            test("teamkill.aqua", {
                start: 9,
                succeeds: true,
                suggestions: ["aqua"]
            });
        });
        it("should support a custom criterion", () => {
            test("minecraft.custom:minecraft.some_custom", {
                start: 17,
                succeeds: true,
                suggestions: ["minecraft.some_custom"]
            });
        });
        it("should support a custom criterion without the namespace", () => {
            test("minecraft.custom:some_custom", {
                start: 17,
                succeeds: true,
                suggestions: ["minecraft.some_custom"]
            });
        });
        it("should support a custom criterion without any namespace", () => {
            test("custom:some_custom", {
                start: 7,
                succeeds: true,
                suggestions: ["minecraft.some_custom"]
            });
        });
    });
});
