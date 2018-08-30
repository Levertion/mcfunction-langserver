import * as assert from "assert";
import { StringReader } from "../../../../brigadier/string-reader";
import { setupFiles } from "../../../../data/noncached";
import { MemoryFS } from "../../../../parsers/minecraft/nbt/doc-fs";
import { parseNBT, parser } from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo, SuggestResult } from "../../../../types";
import { testParser } from "../../../assertions";
import { succeeds } from "../../../blanks";

describe("nbt parser test", () => {
    describe("parse()", async () => {
        const info: ParserInfo = {
            data: {
                globalData: {
                    nbt_docs: await setupFiles("test_data/test_docs")
                }
            }
        } as ParserInfo;

        const tester = testParser(parser);
        it("should parse correctly", () => {
            tester({
                data: {
                    globalData: {
                        nbt_docs: new MemoryFS("")
                    }
                }
            } as ParserInfo)("{foo:{bar:baz}}", succeeds);
        });

        it("should return correct suggestions", () => {
            const reader = new StringReader("{display:{");
            const out = parseNBT(reader, info, { type: "item" });
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
