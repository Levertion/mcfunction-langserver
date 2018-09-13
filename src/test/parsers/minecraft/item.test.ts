import { GlobalData } from "../../../data/types";
import { convertToNamespace } from "../../../misc-functions";
import {
    predicate as predicateParser,
    stack as stackParser
} from "../../../parsers/minecraft/item";
import { testParser } from "../../assertions";

const global: GlobalData = {
    items: [
        "test:item_one",
        "test:item_two",
        "test:item_three",
        "test:item_four",
        "test:item_four_one",
        "minecraft:apple",
        "minecraft:coal"
    ],
    meta_info: {
        version: "3"
    },
    resources: {
        item_tags: [
            convertToNamespace("test:item_tag_one"),
            convertToNamespace("test:item_tag_two"),
            convertToNamespace("test:item_tag_two_one")
        ]
    }
} as any;

describe("item parser (no tags)", () => {
    const tester = testParser(stackParser)({
        data: {
            globalData: global
        }
    });
    describe("parse", () => {
        it("should parse a valid item", () => {
            tester("test:item_one", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "test:item_one"
                    }
                ]
            });
        });
        it("should throw when encountering a correct tag", () => {
            tester("#test:item_tag_one", {
                errors: [
                    {
                        code: "argument.item.tag.disallowed",
                        range: {
                            end: 18,
                            start: 0
                        }
                    }
                ],
                succeeds: false
            });
        });
        it("should throw when encountering a bad tag", () => {
            tester("#test:bad_tag", {
                errors: [
                    {
                        code: "argument.item.tag.disallowed",
                        range: {
                            end: 13,
                            start: 0
                        }
                    }
                ],
                succeeds: false
            });
        });
        it("should give multiple item suggestion", () => {
            tester("test:item_four", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "test:item_four"
                    },
                    {
                        start: 0,
                        text: "test:item_four_one"
                    }
                ]
            });
        });
        it("should return an error on an invalid item", () => {
            tester("test:bad_item", {
                errors: [
                    {
                        code: "argument.item.id.invalid",
                        range: {
                            end: 13,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
        });
        it("should succeed with an item with the 'miencraft' namespace", () => {
            tester("minecraft:coal", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "minecraft:coal"
                    }
                ]
            });
        });
    });
});
describe("item predicate parser", () => {
    describe("parse", () => {
        const tester = testParser(predicateParser)({
            data: {
                globalData: global
            }
        });
        it("should parse a valid item", () => {
            tester("test:item_one", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "test:item_one"
                    }
                ]
            });
        });
        it("should parse a valid tag", () => {
            tester("#test:item_tag_one", {
                succeeds: true,
                suggestions: [
                    {
                        start: 1,
                        text: "test:item_tag_one"
                    }
                ]
            });
        });
        it("should give multiple tag suggestions", () => {
            tester("#test:item_tag_two", {
                succeeds: true,
                suggestions: [
                    {
                        start: 1,
                        text: "test:item_tag_two"
                    },
                    {
                        start: 1,
                        text: "test:item_tag_two_one"
                    }
                ]
            });
        });
        it("should return an error on an invalid tag", () => {
            tester("#test:bad_tag", {
                errors: [
                    {
                        code: "arguments.item.tag.unknown",
                        range: {
                            end: 13,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
        });
    });
});
