import { ok } from "assert";
import { parseBlockArgument } from "../../../../parsers/minecraft/block/shared";
import { CommmandData, Parser } from "../../../../types";
import { testParser } from "../../../assertions";
import { blankproperties, succeeds } from "../../../blanks";

const parser: Parser = {
    parse: (reader, info) =>
        parseBlockArgument(reader, info, !!info.node_properties.tags)
};

const blockArgumentTester = testParser(parser);

const data: CommmandData = {
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
                { namespace: "test", path: "empty" },
                {
                    data: { values: [] },
                    namespace: "test",
                    path: "empty_values"
                },
                {
                    data: {
                        values: ["langserver:multi", "langserver:props", "test"]
                    },
                    namespace: "test",
                    path: "plain"
                },
                { namespace: "minecraft", path: "empty" },
                {
                    data: { values: ["minecraft:test", "langserver:noprops"] },
                    namespace: "minecraft",
                    path: "plain"
                },
                {
                    data: { values: ["langserver:props", "#plain"] },
                    namespace: "test",
                    path: "othertags"
                },
                {
                    data: {
                        values: ["langserver:props", "#test:plain"]
                    },
                    namespace: "test",
                    path: "duplicated_block"
                },
                {
                    data: {
                        values: [
                            "langserver:multi",
                            "unknown",
                            "langserver:notablock"
                        ]
                    },
                    namespace: "test",
                    path: "invalid_block"
                }
            ]
        }
    },
    localData: {
        packs: {
            0: {
                data: {
                    block_tags: [
                        {
                            data: { values: ["#plain", "langserver:multi"] },
                            namespace: "localdata",
                            path: "token"
                        }
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
                suggestions: ["test:empty", "test:empty_values"]
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
                succeeds: true
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
                suggestions: ["otherprop", "prop1", "prop", "state"]
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
});

function plainBlockTests(test: ReturnType<typeof blockArgumentTester>): void {
    it("should allow a plain block", () => {
        test("langserver:noprops", {
            succeeds: true,
            suggestions: ["langserver:noprops"]
        });
    });
    it("should successfully parse an empty properties", () => {
        test("langserver:noprops[]", {
            succeeds: true
        });
    });
    it("should successfully parse an empty properties with whitespace", () => {
        test("langserver:noprops[  ]", { succeeds: true });
    });
    it("should successfully parse a single block's properties", () => {
        test("langserver:props[prop=value]", { succeeds: true });
    });
    it("should successfully parse a single block's properties with quotes", () => {
        test('langserver:props["prop"="value"]', {
            succeeds: true
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
            succeeds: true
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
            succeeds: true
        });
    });
    it("should allow multiple properties", () => {
        test("langserver:multi[otherprop=propvalue,prop1=other]", succeeds);
    });
    it("should give an error for duplicate properties", () => {
        test("langserver:multi[otherprop=propvalue,otherprop=lang]", {
            errors: [
                {
                    code: "argument.block.property.duplicate",
                    range: { start: 37, end: 46 }
                }
            ],
            succeeds: true
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
            suggestions: [{ start: 27, text: "lang" }]
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
                "langserver:props"
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
                "minecraft:lang"
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
            suggestions: ["prop1", "otherprop"]
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
            suggestions: [{ start: 17, text: "prop" }]
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
            suggestions: ["value", "value2", "other"]
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
            suggestions: ["value", "value2"]
        });
    });
}
