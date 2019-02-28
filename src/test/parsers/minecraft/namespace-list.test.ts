import { CommandErrorBuilder } from "../../../brigadier/errors";
import { RegistryListParser } from "../../../parsers/minecraft/namespace-list";
import { snapshot, testParser } from "../../assertions";

const parser = new RegistryListParser(
    "minecraft:biome",
    new CommandErrorBuilder("namespace.test.unknown", "Unkown")
);

const tester = testParser(parser)({
    data: {
        globalData: {
            registries: {
                "minecraft:biome": [
                    "minecraft:test",
                    "minecraft:test2",
                    "minecraft:other",
                    "something:hello"
                ]
            }
        }
    }
} as any);

describe("NamespaceListParser", () => {
    it("should work correctly for various inputs", () => {
        snapshot(
            tester,
            "minecraft:test",
            "something:hello",
            "unknown:unknown",
            "fail:fail:fail",
            ""
        );
    });
});
