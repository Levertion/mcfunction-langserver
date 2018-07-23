import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import { isSuccessful } from "../../../../misc_functions";
import { CoordParser } from "../../../../parsers/minecraft/coord/coord_base";
import { assertErrors } from "../../../assertions";

describe("Coordinate tests", () => {
    describe("parse()", () => {
        describe("settings: {count: 2, float: false, local: true }", () => {
            const parser = new CoordParser({
                count: 2,
                float: false,
                local: true
            });
            ["~1 ~", "2 3", "5 ~", "~ ~"].forEach(v =>
                it(`should work for coord ${v}`, () => {
                    assert.ok(isSuccessful(parser.parse(new StringReader(v))));
                })
            );
            it("should return a mix error for coord '1 ^4'", () => {
                const out = parser.parse(new StringReader("1 ^4"));
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
                );
            });
            it("should return a mix error for coord '~1 ^4'", () => {
                const out = parser.parse(new StringReader("~1 ^4"));
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
                );
            });
            it("should return an incomplete error for coord '~2 '", () => {
                const out = parser.parse(new StringReader("~2 "));
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
                );
            });
            it("should return an invalid int error for coord '1.3 1'", () => {
                const out = parser.parse(new StringReader("1.3 1 "));
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
                );
            });
        });
        describe("settings: {count: 3, float: true , local: true }", () => {
            const parser = new CoordParser({
                count: 3,
                float: true,
                local: true
            });
            [
                "1 2 3",
                "~1 ~2 3",
                "^1 ^ ^2",
                "~ ~ ~",
                "1.2 3 ~1",
                "^.1 ^ ^3"
            ].forEach(v =>
                it(`sould work for coord ${v}`, () => {
                    assert.ok(isSuccessful(parser.parse(new StringReader(v))));
                })
            );
        });
        describe("settings: {count: 2, float: true , local: false}", () => {
            const parser = new CoordParser({
                count: 2,
                float: true,
                local: false
            });
            ["~1 ~", "2 3", "5 ~20", "~ ~"].forEach(v =>
                it(`should work for coord ${v}`, () => {
                    assert.ok(isSuccessful(parser.parse(new StringReader(v))));
                })
            );
            it("should return a no local error for coord '^ ^3'", () => {
                const out = parser.parse(new StringReader("^ ^3"));
                assertErrors(
                    [
                        {
                            code: "argument.pos.nolocal",
                            range: {
                                end: 1,
                                start: 0
                            }
                        },
                        {
                            code: "argument.pos.nolocal",
                            range: {
                                end: 3,
                                start: 2
                            }
                        }
                    ],
                    out.errors
                );
            });
        });
    });
});
