import { StringReader } from "../../../../brigadier/string-reader";
import { loadNBTDocs } from "../../../../data/noncached";
import {
    nbtParser,
    validateParse
} from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo, SuggestResult } from "../../../../types";
import {
    assertSuggestions,
    SuggestedOption,
    testParser
} from "../../../assertions";
import { testDocs } from "./test-data";

describe("nbt parser test", () => {
    describe("parse()", () => {
        let info: ParserInfo;
        let reginfo: ParserInfo;

        before(async () => {
            info = {
                data: {
                    globalData: {
                        nbt_docs: testDocs
                    }
                },
                suggesting: true
            } as ParserInfo;
            reginfo = {
                data: {
                    globalData: {
                        nbt_docs: loadNBTDocs()
                    }
                },
                suggesting: true
            } as ParserInfo;
        });
        const tester = testParser(nbtParser);
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
            const out = validateParse(reader, reginfo, {
                ids: "minecraft:apple",
                type: "item"
            });
            assertSuggestions(
                [
                    {
                        start: 9,
                        text: "{"
                    },
                    "}",
                    "Name",
                    "color",
                    "Lore: ["
                ] as SuggestResult[],
                out.suggestions,
                10
            );
        });
        it("should return the correct suggestions when nested in a list", () => {
            const reader = new StringReader("{AttributeModifiers:[{");
            const out = validateParse(reader, reginfo, {
                ids: "minecraft:stick",
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
            const out = validateParse(reader, reginfo, {
                ids: "minecraft:chest",
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
                        text: "tag: {"
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
