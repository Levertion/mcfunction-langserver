import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import { parseNBT, parser } from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo, SuggestResult } from "../../../../types";

describe("nbt parser test", () => {
    describe("parse()", () => {
        it("should parse correctly", () => {
            const reader = new StringReader("{foo:{bar:baz}}");
            const out = parser.parse(reader, {} as ParserInfo);
            assert.ok(out.kind);
        });
        it("should return correct suggestions", () => {
            const reader = new StringReader("{display:{");
            const out = parseNBT(reader, { type: "item" });
            assert.deepStrictEqual(out.suggestions, [
                {
                    description: "A JSON text component for the items name",
                    start: 9,
                    text: "Name"
                },
                {
                    description:
                        "The color of leather armor. Still exists on other items",
                    start: 9,
                    text: "color"
                },
                {
                    description:
                        "Lines of lore. Each line is a JSON text component",
                    start: 9,
                    text: "Lore"
                }
            ] as SuggestResult[]);
        });
    });
});
