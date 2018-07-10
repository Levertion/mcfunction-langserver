import * as assert from "assert";

import { StringReader } from "../../../brigadier_components/string_reader";
import { namespacesEqual } from "../../../misc_functions";
import { parseNamespaceOrTag } from "../../../misc_functions/parsing/nmsp_tag";
import { ParserInfo } from "../../../types";
import { assertNamespaces, returnAssert } from "../../assertions";
import { blankproperties, succeeds } from "../../blanks";

const data: ParserInfo = {
    ...blankproperties,
    data: {
        globalData: {
            resources: {
                block_tags: [
                    {
                        data: { values: ["#outside:tock", "minecraft:stone"] },
                        namespace: "minecraft",
                        path: "tick"
                    },
                    {
                        data: { values: ["minecraft:white_wool"] },
                        namespace: "outside",
                        path: "tock"
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
                                data: { values: ["minecraft:red_wool"] },
                                namespace: "outside",
                                path: "tock"
                            }
                        ]
                    },
                    name: "test1"
                }
            }
        }
    } as any,

    suggesting: false
};

describe("parseNamespaceOrTag", () => {
    it("should allow a normal namespace to be parsed", () => {
        const reader = new StringReader("minecraft:stone");
        const result = parseNamespaceOrTag(reader, {
            ...blankproperties,
            suggesting: false
        });
        if (returnAssert(result, succeeds)) {
            assert(
                namespacesEqual(result.data.parsed, {
                    namespace: "minecraft",
                    path: "stone"
                })
            );
        }
    });
    it("should give an error with an invalid namespace", () => {
        const reader = new StringReader("minecraft:fail:surplus");
        const result = parseNamespaceOrTag(reader, {
            ...blankproperties,
            suggesting: false
        });
        if (
            returnAssert(result, {
                errors: [
                    {
                        code: "argument.id.invalid",
                        range: { start: 14, end: 15 }
                    }
                ],
                succeeds: false
            })
        ) {
            assert.equal(result.data, undefined);
        }
    });
    it("should give an error when there is a tag but tags are not supported", () => {
        const reader = new StringReader("#minecraft:tag");
        const result = parseNamespaceOrTag(
            reader,
            {
                ...blankproperties,
                suggesting: false
            },
            undefined
        );
        if (
            returnAssert(result, {
                errors: [
                    {
                        code: "argument.tags.notallowed",
                        range: { start: 1, end: 14 }
                    }
                ],
                succeeds: false
            })
        ) {
            assert.equal(result.data, undefined);
        }
    });
    it("should fail when there is a tag which is unknown", () => {
        const reader = new StringReader("#minecraft:tag");
        const result = parseNamespaceOrTag(reader, data, "block_tags");
        if (
            returnAssert(result, {
                succeeds: false
            })
        ) {
            assert.deepStrictEqual(result.data, {
                namespace: "minecraft",
                path: "tag"
            });
        }
    });
    it("should resolve the tag successfully", () => {
        const reader = new StringReader("#minecraft:tick");
        const result = parseNamespaceOrTag(reader, data, "block_tags");
        if (returnAssert(result, { succeeds: true })) {
            assert.deepStrictEqual(result.data.parsed, {
                namespace: "minecraft",
                path: "tick"
            });
            assertNamespaces(
                [
                    { namespace: "minecraft", path: "stone" },
                    { namespace: "minecraft", path: "white_wool" },
                    { namespace: "minecraft", path: "red_wool" }
                ],
                result.data.resolved
            );
        }
    });
});
