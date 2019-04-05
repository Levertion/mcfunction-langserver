import { GlobalData } from "../../../data/types";
import { convertToID } from "../../../misc-functions";
import {
    predicate as predicateParser,
    stack as stackParser
} from "../../../parsers/minecraft/item";
import { snapshot, testParser } from "../../assertions";

const global: GlobalData = {
    meta_info: {
        version: "3"
    },
    registries: {
        "minecraft:item": new Set([
            "test:item_one",
            "test:item_two",
            "test:item_three",
            "test:item_four",
            "test:item_four_one",
            "minecraft:apple",
            "minecraft:coal"
        ])
    },
    resources: {
        item_tags: [
            convertToID("test:item_tag_one"),
            convertToID("test:item_tag_two"),
            convertToID("test:item_tag_two_one")
        ]
    }
} as any;

describe("item stack parser (no tags)", () => {
    const stacktester = testParser(stackParser)({
        data: {
            globalData: global
        }
    });
    it("should have the correct output for various inputs", () => {
        snapshot(
            stacktester,
            "test:item_one",
            "#test:item_tag_one",
            "#test:bad_tag",
            "test:item_four",
            "test:bad_item",
            "minecraft:coal"
        );
    });
});

describe("item predicate parser", () => {
    const predicateTester = testParser(predicateParser)({
        data: {
            globalData: global
        }
    });
    it("should give the correct output for various inputs", () => {
        snapshot(
            predicateTester,
            "test:item_one",
            "#test:item_tag_one",
            "#test:item_tag_two",
            "#test:bad_tag"
        );
    });
});
