import { criteriaParser } from "../../../parsers/minecraft/scoreboard";
import { snapshot, testParser } from "../../assertions";

describe("criterion parser", () => {
    const test = testParser(criteriaParser)({
        data: {
            globalData: {
                registries: {
                    "minecraft:custom_stat": new Set(["minecraft:some_custom"]),
                    "minecraft:item": new Set([
                        "minecraft:some_item",
                        "minecraft:some_other_item"
                    ])
                }
            }
        } as any
    });
    it("should parse correctly", () => {
        snapshot(
            test,
            "air",
            "teamkill.aqua",
            "minecraft.custom:minecraft.some_custom",
            "minecraft.custom:some_custom",
            "custom:some_custom"
        );
    });
});
