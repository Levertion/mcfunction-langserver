import { StringReader } from "../../../../brigadier/string-reader";
import { setupFiles } from "../../../../data/noncached";
import { parseNBT, parser } from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo, SuggestResult } from "../../../../types";
import { assertSuggestions, testParser } from "../../../assertions";

describe("nbt parser test", () => {
    describe("parse()", () => {
        let info: ParserInfo;
        let reginfo: ParserInfo;

        before(async () => {
            info = {
                data: {
                    globalData: {
                        nbt_docs: await setupFiles("test_data/test_docs")
                    }
                },
                suggesting: true
            } as ParserInfo;
            reginfo = {
                data: {
                    globalData: {
                        nbt_docs: await setupFiles()
                    }
                },
                suggesting: true
            } as ParserInfo;
        });
        const tester = testParser(parser);
        it("should parse correctly", () => {
            tester(info)("{foo:{bar:baz}}", {
                succeeds: true,
                suggestions: [
                    {
                        start: 14,
                        text: "}"
                    }
                ]
            });
        });

        it("should return correct suggestions", () => {
            const reader = new StringReader("{display:{");
            const out = parseNBT(reader, reginfo, { type: "item" });
            assertSuggestions(out.suggestions, [
                {
                    start: 9,
                    text: "{"
                },
                {
                    start: 10,
                    text: "}"
                },
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
