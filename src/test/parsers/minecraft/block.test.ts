import { ok } from "assert";

import { loadNBTDocs } from "../../../data/noncached";
import { GlobalData } from "../../../data/types";
import { parseBlockArgument } from "../../../parsers/minecraft/block";
import { CommandData, Parser } from "../../../types";
import {
    convertToResource,
    SuggestedOption,
    testParser
} from "../../assertions";
import { blankproperties } from "../../blanks";

import { snbtTestData } from "./nbt/test-data";

const parser: Parser = {
    parse: (reader, info) =>
        parseBlockArgument(reader, info, !!info.node_properties.tags)
};

const blockArgumentTester = testParser(parser);

const data: CommandData = {
    globalData: {
        blocks: {
            "langserver:multi": {
                otherprop: ["lang", "propvalue"],
                prop1: ["value", "value2", "other"]
            },
            "langserver:noprops": {},
            "langserver:props": {
                prop: ["value", "value2", "other"]
            },
            "minecraft:lang": {},
            "minecraft:test": { state: ["react", "redux"] }
        },
        resources: {
            block_tags: [
                convertToResource("test:empty"),
                convertToResource("test:empty_values", { values: [] }),
                convertToResource("test:plain", {
                    values: ["langserver:multi", "langserver:props", "test"]
                }),
                convertToResource("minecraft:empty"),
                convertToResource("minecraft:plain", {
                    values: ["minecraft:test", "langserver:noprops"]
                }),
                convertToResource("test:othertags", {
                    values: ["langserver:props", "#plain"]
                }),
                convertToResource("test:duplicated_block", {
                    values: ["langserver:props", "#test:plain"]
                }),
                convertToResource("test:invalid_block", {
                    values: [
                        "langserver:multi",
                        "unknown",
                        "langserver:notablock"
                    ]
                })
            ]
        }
    },
    localData: {
        packs: {
            0: {
                data: {
                    block_tags: [
                        convertToResource("localdata:token", {
                            values: ["#plain", "langserver:multi"]
                        })
                    ]
                }
            }
        }
    }
} as any;
describe("sharedBlockParser", () => {
    describe("Tags allowed", () => {
        const test = blockArgumentTester({
            ...blankproperties,
            data,
            node_properties: { tags: true }
        });
        plainBlockTests(test);
        it("should parse a plain tag", () => {
            test("#test:empty", {
                start: 1,
                succeeds: true,
                suggestions: [
                    "test:empty",
                    "test:empty_values",
                    {
                        start: 11,
                        text: "{"
                    },
                    {
                        start: 11,
                        text: "["
                    }
                ]
            });
        });
        it("should give an error for an unknown tag", () => {
            test("#test:unknown", {
                errors: [
                    {
                        code: "arguments.block.tag.unknown",
                        range: { start: 0, end: 13 }
                    }
                ],
                succeeds: true,
                suggestions: [
                    {
                        start: 13,
                        text: "{"
                    },
                    {
                        start: 13,
                        text: "["
                    }
                ]
            });
        });
        it("should suggest the correct properties", () => {
            const [result] = test("#test:plain[", {
                errors: [
                    {
                        code: "argument.block.property.unclosed",
                        range: { start: 11, end: 12 }
                    }
                ],
                numActions: 1,
                start: 12,
                succeeds: false,
                suggestions: [
                    "otherprop",
                    "prop1",
                    "prop",
                    "state",
                    { start: 11, text: "[" },
                    "]"
                ]
            });
            ok(result.actions.every(a => a.type === "hover"));
        });
    });
    describe("Tags not allowed", () => {
        const test = blockArgumentTester({
            ...blankproperties,
            data,
            node_properties: { tags: false }
        });
        plainBlockTests(test);
        it("should give an error when tags are used", () => {
            test("#minecraft:anything", {
                errors: [
                    {
                        code: "argument.block.tag.disallowed",
                        range: { start: 0, end: 19 }
                    }
                ],
                succeeds: false
            });
        });
        // N.B properties are never actually parsed in this case
        it("should not give further errors when properties are used", () => {
            test("#minecraft:anything[anyprop=value]", {
                errors: [
                    {
                        code: "argument.block.tag.disallowed",
                        range: { start: 0, end: 19 }
                    }
                ],
                succeeds: false
            });
        });
    });

    describe("block & NBT tests", () => {
        const test = blockArgumentTester({
            data: {
                globalData: ({
                    blocks: {
                        "langserver:nbt": {},
                        "langserver:nbt_prop": {
                            prop: ["1", "2", "3"]
                        },
                        "langserver:nbt_two": {}
                    },
                    nbt_docs: snbtTestData
                } as any) as GlobalData
            }
        });

        it("should parse correctly for a regular block", () => {
            const tester = blockArgumentTester({
                data: {
                    globalData: ({
                        blocks: {
                            "minecraft:chest": {}
                        },
                        nbt_docs: loadNBTDocs()
                    } as any) as GlobalData
                }
            });
            const suggestions = [
                "id",
                "x",
                "y",
                "z",
                "Items: [",
                "LootTable",
                "LootTableSeed",
                "CustomName",
                "Lock"
            ];
            tester("minecraft:chest{", {
                errors: [
                    {
                        code: "argument.nbt.compound.nokey",
                        range: {
                            end: 16,
                            start: 16
                        }
                    }
                ],
                numActions: 1,
                succeeds: true,
                suggestions: [
                    {
                        start: 15,
                        text: "{"
                    },
                    {
                        start: 16,
                        text: "}"
                    },
                    ...suggestions.map<SuggestedOption>(v => ({
                        start: 16,
                        text: v
                    }))
                ]
            });
        });
        it("should parse correctly with NBT", () => {
            test('langserver:nbt{customTag:"Hello World"}', {
                numActions: 4, // Open bracket, key, value, close bracket
                succeeds: true,
                suggestions: [
                    {
                        start: 38,
                        text: "}"
                    }
                ]
            });
        });
        it("should parse correctly with properties and NBT", () => {
            test('langserver:nbt_prop[prop=1]{customTag:"Hello World"}', {
                succeeds: true,
                suggestions: [
                    {
                        start: 51,
                        text: "}"
                    }
                ]
            });
        });
        it("should give the correct suggestions for tag names", () => {
            test("langserver:nbt{", {
                errors: [
                    {
                        code: "argument.nbt.compound.nokey",
                        range: {
                            end: 15,
                            start: 15
                            // Could argue 14 is better, but this gets messy
                            // If we decide this is better we should change it.
                        }
                    }
                ],
                numActions: 1,
                succeeds: true,
                suggestions: [
                    {
                        start: 15,
                        text: "customTag"
                    },
                    {
                        start: 14,
                        text: "{"
                    },
                    {
                        start: 15,
                        text: "}"
                    }
                ]
            });
        });
        it("should suggest a `{` if there is none at the end", () => {
            test("langserver:nbt_two", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "langserver:nbt_two"
                    },
                    {
                        start: 18,
                        text: "{"
                    },
                    {
                        start: 18,
                        text: "["
                    }
                ]
            });
        });
        it("should give the correct tag names for merged child_ref", () => {
            test("langserver:nbt_two{", {
                errors: [
                    {
                        code: "argument.nbt.compound.nokey",
                        range: {
                            end: 19,
                            start: 19
                        }
                    }
                ],
                numActions: 1,
                succeeds: true,
                suggestions: [
                    {
                        start: 18,
                        text: "{"
                    },
                    {
                        start: 19,
                        text: "}"
                    },
                    {
                        start: 19,
                        text: "key0"
                    },
                    {
                        start: 19,
                        text: "key1"
                    }
                ]
            });
        });
    });
});

function plainBlockTests(test: ReturnType<typeof blockArgumentTester>): void {
    it("should allow a plain block", () => {
        test("langserver:noprops", {
            succeeds: true,
            suggestions: [
                "langserver:noprops",
                { start: 18, text: "{" },
                { start: 18, text: "[" }
            ]
        });
    });
    it("should successfully parse an empty properties", () => {
        test("langserver:noprops[]", {
            succeeds: true,
            suggestions: [{ start: 20, text: "{" }, { start: 19, text: "]" }]
        });
    });
    it("should successfully parse an empty properties with whitespace", () => {
        test("langserver:noprops[  ]", {
            succeeds: true,
            suggestions: [{ start: 22, text: "{" }, { start: 21, text: "]" }]
        });
    });
    it("should successfully parse a single block's properties", () => {
        test("langserver:props[prop=value]", {
            succeeds: true,
            suggestions: [{ start: 28, text: "{" }, { start: 27, text: "]" }]
        });
    });
    it("should successfully parse a single block's properties with quotes", () => {
        test('langserver:props["prop"="value"]', {
            succeeds: true,
            suggestions: [{ start: 32, text: "{" }, { start: 31, text: "]" }]
        });
    });
    it("should give the correct error for an unknown property", () => {
        test("langserver:props[unknown=value]", {
            errors: [
                {
                    code: "argument.block.property.unknown",
                    range: { start: 17, end: 24 }
                }
            ],
            succeeds: true,
            suggestions: [{ start: 31, text: "{" }, { start: 30, text: "]" }]
        });
    });
    it("should give an error for an incorrect property value", () => {
        test("langserver:props[prop=unknown]", {
            errors: [
                {
                    code: "argument.block.property.invalid",
                    range: { start: 22, end: 29 }
                }
            ],
            succeeds: true,
            suggestions: [{ start: 30, text: "{" }, { start: 29, text: "]" }]
        });
    });
    it("should allow multiple properties", () => {
        test("langserver:multi[otherprop=propvalue,prop1=other]", {
            succeeds: true,
            suggestions: [{ start: 49, text: "{" }, { start: 48, text: "]" }]
        });
    });
    it("should give an error for duplicate properties", () => {
        test("langserver:multi[otherprop=propvalue,otherprop=lang]", {
            errors: [
                {
                    code: "argument.block.property.duplicate",
                    range: { start: 37, end: 46 }
                }
            ],
            succeeds: true,
            suggestions: [{ start: 52, text: "{" }, { start: 51, text: "]" }]
        });
    });
    it("should give an error when the properties are not closed", () => {
        test("langserver:multi[otherprop=lang", {
            errors: [
                {
                    code: "argument.block.property.unclosed",
                    range: { start: 16, end: 31 }
                }
            ],
            succeeds: false,
            suggestions: [
                { start: 27, text: "lang" },
                { start: 31, text: "]" },
                { start: 31, text: "," }
            ]
        });
    });
    it("should give the correct block suggestions", () => {
        test("langserver:", {
            errors: [
                {
                    code: "argument.block.id.invalid",
                    range: { start: 0, end: 11 }
                }
            ],
            succeeds: true, // Even though is invalid, it could be valid if there was a block "langserver:""
            suggestions: [
                "langserver:multi",
                "langserver:noprops",
                "langserver:props",
                {
                    start: 11,
                    text: "{"
                },
                {
                    start: 11,
                    text: "["
                }
            ]
        });
    });
    it("should suggest the blocks with both the namespace and in the minecraft namespace", () => {
        test("lang", {
            succeeds: true,
            suggestions: [
                "langserver:multi",
                "langserver:noprops",
                "langserver:props",
                "minecraft:lang",
                {
                    start: 4,
                    text: "{"
                },
                {
                    start: 4,
                    text: "["
                }
            ]
        });
    });
    it("should suggest the correct property names", () => {
        test("langserver:multi[", {
            errors: [
                {
                    code: "argument.block.property.unclosed",
                    range: { start: 16, end: 17 }
                }
            ],
            start: 17,
            succeeds: false,
            suggestions: ["prop1", "otherprop", "]", { start: 16, text: "[" }]
        });
    });
    it("should give an error when there is no value given", () => {
        test("langserver:props[prop", {
            errors: [
                {
                    code: "argument.block.property.novalue",
                    range: { start: 17, end: 21 }
                }
            ],
            succeeds: false,
            suggestions: [{ start: 17, text: "prop" }, { start: 21, text: "=" }]
        });
    });
    it("should give an error when there is no value given", () => {
        test('langserver:props["prop"extra', {
            errors: [
                {
                    code: "argument.block.property.novalue",
                    range: { start: 17, end: 23 }
                }
            ],
            succeeds: false
        });
    });
    it("should give the correct suggestions for an empty property value", () => {
        test("langserver:props[prop=", {
            errors: [
                {
                    code: "argument.block.property.unclosed",
                    range: { start: 16, end: 22 }
                }
            ],
            start: 22,
            succeeds: false,
            suggestions: [
                "value",
                "value2",
                "other",
                "]",
                ",",
                { start: 21, text: "=" }
            ]
        });
    });
    it("should give the correct suggestions for a started property value", () => {
        test("langserver:props[prop=val", {
            errors: [
                {
                    code: "argument.block.property.unclosed",
                    range: { start: 16, end: 25 }
                },
                {
                    code: "argument.block.property.invalid",
                    range: { start: 22, end: 25 }
                }
            ],
            start: 22,
            succeeds: false,
            suggestions: [
                "value",
                "value2",
                { start: 25, text: "]" },
                { start: 25, text: "," }
            ]
        });
    });
}
