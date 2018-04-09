import assert = require("assert");
import { StringReader } from "../../../../../../brigadier_components/string_reader";
import { NBTTagCompound } from "../../../../../../parse/parsers/minecraft/nbt/tag/compound_tag";
import { NBTHighlightAction } from "../../../../../../parse/parsers/minecraft/nbt/util/nbt_util";
import { equalValue } from "../../../../../../util";

interface HighlightTest { t: string; v: NBTHighlightAction[]; }

describe("CompoundTag tests", () => {
    describe("getHighlight()", () => {
        ([
            {
                t: "{foo:bar}",
                v: [
                    {
                        end: 1,
                        scopes: [
                            "compound-start",
                            "start",
                        ],
                        start: 0,
                    },
                    {
                        end: 4,
                        scopes: [
                            "string",
                            "unquoted",
                            "key",
                        ],
                        start: 1,
                    },
                    {
                        end: 5,
                        scopes: [
                            "compound",
                            "key-value",
                            "separator",
                        ],
                        start: 4,
                    },
                    {
                        end: 8,
                        scopes: [
                            "string",
                            "unquoted",
                        ],
                        start: 5,
                    },
                    {
                        end: 8,
                        scopes: [
                            "value",
                        ],
                        start: 5,
                    },
                    {
                        end: 9,
                        scopes: [
                            "compound-end",
                            "end",
                        ],
                        start: 8,
                    },
                    {
                        end: 9,
                        scopes: [
                            "compound",
                        ],
                        start: 0,
                    },
                ],
            },
        ] as HighlightTest[]).forEach(
            (v) => it(v.t + " should return correct highlights", () => {
                const reader = new StringReader(v.t);
                const tag = new NBTTagCompound({});
                tag.parse(reader);
                const highlight = tag.getHighlight();
                assert.ok(
                    highlight.length === v.v.length &&
                    highlight.every(
                        (v2) => v.v.find(
                            (v3) => equalValue(v2, v3),
                        ) !== undefined,
                    ),
                    JSON.stringify(v.v) + " is not " + JSON.stringify(highlight, null, "\t"),
                );
            }),
        );
    });
});
