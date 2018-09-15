import { CommandErrorBuilder } from "../../../brigadier/errors";
import { NamespaceListParser } from "../../../parsers/minecraft/namespace-list";
import { testParser } from "../../assertions";

const parser = new NamespaceListParser(
    ["minecraft:test", "minecraft:test2", "minecraft:other", "something:hello"],
    new CommandErrorBuilder("namespace.test.unknown", "Unkown")
);

const tester = testParser(parser)();

describe("NamespaceListParser", () => {
    it("should allow a known namespace", () => {
        tester("minecraft:test", {
            succeeds: true,
            suggestions: ["minecraft:test", "minecraft:test2"]
        });
    });
    it("should accept a non-minecraft namespace", () => {
        tester("something:hello", {
            succeeds: true,
            suggestions: ["something:hello"]
        });
    });
    it("should give the given error for an incorrect namespace", () => {
        tester("unknown:unknown", {
            errors: [
                {
                    code: "namespace.test.unknown",
                    range: { start: 0, end: 15 }
                }
            ],
            succeeds: true
        });
    });
    it("should fail for an unparseable namespace", () => {
        tester("fail:fail:fail", {
            errors: [
                { code: "argument.id.invalid", range: { start: 9, end: 10 } }
            ],
            succeeds: false
        });
    });
    it("should suggest all values for an empty string", () => {
        tester("", {
            errors: [
                { code: "namespace.test.unknown", range: { start: 0, end: 0 } }
            ],
            succeeds: true,
            suggestions: [
                "minecraft:test",
                "minecraft:test2",
                "minecraft:other",
                "something:hello"
            ]
        });
    });
});
