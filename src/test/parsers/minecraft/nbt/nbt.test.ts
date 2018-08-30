import * as assert from "assert";
import { StringReader } from "../../../../brigadier/string-reader";
import { setupFiles } from "../../../../data/noncached";
import { MemoryFS } from "../../../../parsers/minecraft/nbt/doc-fs";
import { parseNBT, parser } from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo, SuggestResult } from "../../../../types";

describe("nbt parser test", () => {
    describe("parse()", async () => {
        it("should parse correctly", () => {
            const reader = new StringReader("{foo:{bar:baz}}");
            const out = parser.parse(reader, {
                data: {
                    globalData: {
                        nbt_docs: new MemoryFS("")
                    }
                }
            } as ParserInfo);
            assert.ok(out.kind);
        });

        const v = await setupFiles();

        it("should return correct suggestions", () => {
            const reader = new StringReader("{display:{");
            const out = parseNBT(reader, v, { type: "item" });
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
