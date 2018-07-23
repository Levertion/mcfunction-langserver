import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import { isSuccessful } from "../../../../misc_functions";
import {
    CoordBaseParser,
    CoordRules
} from "../../../../parsers/minecraft/coord/coord_base";
import { ReturnedInfo } from "../../../../types";
import { assertErrors } from "../../../assertions";

const toString = (v: CoordRules) =>
    `{count: ${v.count}, float: ${v.float}, local: ${v.local}}`;

describe("Coordinate tests", () => {
    describe("parse()", () => {
        ([
            {
                s: {
                    count: 2,
                    float: false,
                    local: true
                },
                v: [
                    {
                        f: out => assert.ok(isSuccessful(out)),
                        m: "work",
                        v: ["1 2", "~10 5", "^ ^2", "4 ~"]
                    },
                    {
                        f: out =>
                            assertErrors(
                                [
                                    {
                                        code: "argument.pos.mixed",
                                        range: {
                                            end: 3,
                                            start: 2
                                        }
                                    }
                                ],
                                out.errors
                            ),
                        m: "return a mix error",
                        v: ["1 ^4"]
                    },
                    {
                        f: out =>
                            assertErrors(
                                [
                                    {
                                        code: "argument.pos.mixed",
                                        range: {
                                            end: 4,
                                            start: 3
                                        }
                                    }
                                ],
                                out.errors
                            ),
                        m: "return a mix error",
                        v: ["~1 ^4"]
                    },
                    {
                        f: out =>
                            assertErrors(
                                [
                                    {
                                        code: "argument.pos.incomplete",
                                        range: {
                                            end: 3,
                                            start: 0
                                        }
                                    }
                                ],
                                out.errors
                            ),
                        m: "return an incomplete error",
                        v: ["~2 "]
                    },
                    {
                        f: out =>
                            assertErrors(
                                [
                                    {
                                        code: "parsing.int.invalid",
                                        range: {
                                            end: 3,
                                            start: 0
                                        }
                                    }
                                ],
                                out.errors
                            ),
                        m: "return a float error",
                        v: ["1.3 1"]
                    }
                ]
            },
            {
                s: {
                    count: 3,
                    float: true,
                    local: true
                },
                v: [
                    {
                        f: out => assert.ok(isSuccessful(out)),
                        m: "work",
                        v: [
                            "1 2 3",
                            "~1 ~2 3",
                            "^1 ^ ^2",
                            "~ ~ ~",
                            "1.2 3 ~1",
                            "^.1 ^ ^3"
                        ]
                    }
                ]
            },
            {
                s: {
                    count: 2,
                    float: true,
                    local: false
                },
                v: [
                    {
                        f: out => assert.ok(isSuccessful(out)),
                        m: "work",
                        v: ["~1 ~", "2 3", "5 ~20", "~ ~"]
                    },
                    {
                        f: out =>
                            assertErrors(
                                [
                                    {
                                        code: "argument.pos.nolocal",
                                        range: {
                                            end: 1,
                                            start: 0
                                        }
                                    }
                                ],
                                out.errors
                            ),
                        m: "return a no local error",
                        v: ["^ ^3"]
                    }
                ]
            }
        ] as Array<{
            s: CoordRules;
            v: Array<{
                m: string;
                v: string[];
                f(v: ReturnedInfo<undefined>): undefined;
            }>;
        }>).forEach(v =>
            describe(`settings: ${toString(v.s)}`, () =>
                v.v.forEach(t =>
                    t.v.forEach(c =>
                        it(`should ${t.m} for coord '${c}'`, () => {
                            const parser = new CoordBaseParser(v.s);
                            const out = parser.parse(new StringReader(c));
                            t.f(out);
                        })
                    )
                ))
        );
    });
});
