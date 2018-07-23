import { CoordParser } from "../../../../parsers/minecraft/coord/coord_base";
import { testParser } from "../../../assertions";
import { succeeds } from "../../../blanks";

describe("Coordinate tests", () => {
    describe("parse()", () => {
        describe("settings: {count: 2, float: false, local: true }", () => {
            const parser = new CoordParser({
                count: 2,
                float: false,
                local: true
            });
            const tester = testParser(parser)();
            ["~1 ~", "2 3", "5 ~", "~ ~"].forEach(v =>
                it(`should work for coord ${v}`, () => {
                    tester(v, succeeds);
                })
            );
            it("should return a mix error for coord '1 ^4'", () => {
                tester("1 ^4", {
                    errors: [
                        {
                            code: "argument.pos.mixed",
                            range: {
                                end: 4,
                                start: 2
                            }
                        }
                    ],
                    succeeds: true
                });
            });
            it("should return a mix error for coord '~1 ^4'", () => {
                tester("~1 ^4", {
                    errors: [
                        {
                            code: "argument.pos.mixed",
                            range: {
                                end: 5,
                                start: 3
                            }
                        }
                    ],
                    succeeds: true
                });
            });
            it("should return an incomplete error for coord '~2 '", () => {
                tester("~2 ", {
                    errors: [
                        {
                            code: "argument.pos.incomplete",
                            range: {
                                end: 3,
                                start: 0
                            }
                        }
                    ],
                    succeeds: false,
                    suggestions: [
                        {
                            start: 3,
                            text: "~"
                        },
                        {
                            start: 2,
                            text: " "
                        }
                    ]
                });
            });
            it("should return an invalid int error for coord '1.3 1'", () => {
                tester("1.3 1", {
                    errors: [
                        {
                            code: "parsing.int.invalid",
                            range: {
                                end: 3,
                                start: 0
                            }
                        }
                    ],
                    succeeds: false
                });
            });
        });
        describe("settings: {count: 3, float: true , local: true }", () => {
            const parser = new CoordParser({
                count: 3,
                float: true,
                local: true
            });
            const tester = testParser(parser)();
            [
                "1 2 3",
                "~1 ~2 3",
                "^1 ^ ^2",
                "~ ~ ~",
                "1.2 3 ~1",
                "^.1 ^ ^3"
            ].forEach(v =>
                it(`sould work for coord ${v}`, () => {
                    tester(v, succeeds);
                })
            );
        });
        describe("settings: {count: 2, float: true , local: false}", () => {
            const parser = new CoordParser({
                count: 2,
                float: true,
                local: false
            });
            const tester = testParser(parser)();
            ["~1 ~", "2 3", "5 ~20", "~ ~"].forEach(v =>
                it(`should work for coord ${v}`, () => {
                    tester(v, succeeds);
                })
            );
            it("should return a no local error for coord '^ ^3'", () => {
                tester("^ ^3", {
                    errors: [
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
                    succeeds: true
                });
            });
        });
    });
});
