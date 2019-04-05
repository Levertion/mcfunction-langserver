import { GlobalData } from "../../../data/types";
import { parseBlockArgument } from "../../../parsers/minecraft/block";
import { CommandData, Parser } from "../../../types";
import { convertToResource, snapshot, testParser } from "../../assertions";
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
        it("should correctly parse various tag inputs", () => {
            snapshot(test, "#test:empty", "#test:unknown", "#test:plain[");
        });
    });
    describe("Tags not allowed", () => {
        const test = blockArgumentTester({
            ...blankproperties,
            data,
            node_properties: { tags: false }
        });
        plainBlockTests(test);
        it("should do the right thing when tags are provided", () => {
            snapshot(
                test,
                "#minecraft:anything",
                "#minecraft:anything[anyprop=value]"
            );
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

        it("should work correctly for various input with nbt", () => {
            snapshot(
                test,
                'langserver:nbt{customTag:"Hello World"}',
                'langserver:nbt{customTag:"Hello World"}',
                'langserver:nbt_prop[prop=1]{customTag:"Hello World"}',
                "langserver:nbt{",
                "langserver:nbt_two",
                "langserver:nbt_two{"
            );
        });
    });
});

function plainBlockTests(test: ReturnType<typeof blockArgumentTester>): void {
    it("should work correctly for various inputs involving plain blocks", () => {
        snapshot(
            test,
            "langserver:noprops",
            "langserver:noprops[]",
            "langserver:noprops[  ]",
            "langserver:props[prop=value]",
            'langserver:props["prop"="value"]',
            "langserver:props[unknown=value]",
            "langserver:props[prop=unknown]",
            "langserver:multi[otherprop=propvalue,prop1=other]",
            "langserver:multi[otherprop=propvalue,otherprop=lang]",
            "langserver:multi[otherprop=lang",
            "langserver:",
            "lang",
            "langserver:multi[",
            "langserver:props[prop",
            'langserver:props["prop"extra',
            "langserver:props[prop=",
            "langserver:props[prop=val"
        );
    });
}
