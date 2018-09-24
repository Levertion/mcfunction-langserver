import { StringReader } from "../../../../brigadier/string-reader";
import { setupFiles } from "../../../../data/noncached";
import { parseNBT, parser } from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo, SuggestResult } from "../../../../types";
import {
    assertSuggestions,
    SuggestedOption,
    testParser
} from "../../../assertions";

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

        it("should return correct suggestions when nested in a compound", () => {
            const reader = new StringReader("{display:{");
            const out = parseNBT(reader, reginfo, {
                id: "minecraft:apple",
                type: "item"
            });
            assertSuggestions(
                [
                    {
                        start: 9,
                        text: "{"
                    },
                    {
                        start: 10,
                        text: "}"
                    },
                    {
                        start: 10,
                        text: "Name"
                    },
                    {
                        start: 10,
                        text: "color"
                    },
                    {
                        start: 10,
                        text: "Lore"
                    }
                ] as SuggestResult[],
                out.suggestions
            );
        });
        it("should return the correct suggestions when nested in a list", () => {
            const reader = new StringReader("{AttributeModifiers:[{");
            const out = parseNBT(reader, reginfo, {
                id: "minecraft:stick",
                type: "item"
            });
            assertSuggestions(
                [
                    {
                        start: 21,
                        text: "{"
                    },
                    {
                        start: 22,
                        text: "}"
                    },
                    {
                        start: 22,
                        text: "AttributeName"
                    },
                    {
                        start: 22,
                        text: "Name"
                    },
                    {
                        start: 22,
                        text: "Slot"
                    },
                    {
                        start: 22,
                        text: "Amount"
                    },
                    {
                        start: 22,
                        text: "Operation"
                    },
                    {
                        start: 22,
                        text: "UUIDLeast"
                    },
                    {
                        start: 22,
                        text: "UUIDMost"
                    }
                ] as SuggestedOption[],
                out.suggestions
            );
        });
        it("should return the correct suggestion when nested in a list part 2", () => {
            const reader = new StringReader("{Items:[{");
            const out = parseNBT(reader, reginfo, {
                id: "minecraft:chest",
                type: "block"
            });
            assertSuggestions(
                [
                    {
                        start: 8,
                        text: "{"
                    },
                    {
                        start: 9,
                        text: "}"
                    },
                    {
                        start: 9,
                        text: "Slot"
                    },
                    {
                        start: 9,
                        text: "tag"
                    },
                    {
                        start: 9,
                        text: "Count"
                    },
                    {
                        start: 9,
                        text: "id"
                    }
                ],
                out.suggestions
            );
        });
    });
});
