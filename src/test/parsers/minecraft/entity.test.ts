import { deepStrictEqual } from "assert";
import { StringReader } from "../../../brigadier/string-reader";
import {
    EntityBase,
    EntityContext,
    numOptParser,
    OptionParser
} from "../../../parsers/minecraft/entity";
import { CommandData, ParserInfo } from "../../../types";
import {
    returnAssert,
    ReturnAssertionInfo,
    testParser,
    TestParserInfo
} from "../../assertions";
import { blankproperties } from "../../blanks";

const optionTester = (parser: OptionParser) => (
    context: EntityContext,
    info: Partial<TestParserInfo> = {}
) => (
    text: string,
    expected: ReturnAssertionInfo,
    expectedData?: EntityContext
) => {
    const out = parser(
        new StringReader(text),
        {
            // These parsers should used `suggesting`
            ...blankproperties,
            ...info
        } as ParserInfo,
        context
    );
    if (returnAssert(out, expected) && expectedData) {
        deepStrictEqual(out.data, expectedData);
    }
};

describe("entity parser", () => {
    describe("player name", () => {
        const parser = new EntityBase(false, false);
        const tester = testParser(parser)();
        it("should parse a player name", () => {
            tester("FooBar", {
                succeeds: true
            });
        });
        it("should fail if the name is empty", () => {
            tester("", {
                succeeds: false
            });
        });
    });
    describe("UUID", () => {
        const parser = new EntityBase(false, false);
        const tester = testParser(parser)();
        it("should parse a valid UUID", () => {
            tester("f65c863a-747e-4fac-9828-33c3e825d00d", {
                errors: [
                    {
                        code: "argument.entity.uuid",
                        range: {
                            end: 36,
                            start: 0
                        }
                    }
                ],
                succeeds: true
            });
        });
    });
    describe("fake player name", () => {
        const parser = new EntityBase(true, false);
        const tester = testParser(parser)({
            data: {
                localData: {
                    nbt: {
                        scoreboard: {
                            data: {
                                PlayerScores: [
                                    {
                                        Name: "Player1"
                                    },
                                    {
                                        Name: "Player2"
                                    }
                                ]
                            }
                        }
                    }
                }
            } as CommandData
        });
        const nodatatester = testParser(parser)();
        it("should parse correctly", () => {
            tester("Player1", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "Player1"
                    }
                ]
            });
        });
        it("should give the correct suggestions", () => {
            tester("", {
                succeeds: true,
                suggestions: [
                    {
                        start: 0,
                        text: "Player2"
                    },
                    {
                        start: 0,
                        text: "Player1"
                    }
                ]
            });
        });
        it("should succeed if there is no scoreboard data", () => {
            nodatatester("Foobar", {
                succeeds: true
            });
        });
    });
    describe("entity selector", () => {
        const parser = new EntityBase(false, true);
        const testerBuilder = testParser(parser);
        describe("basic selector", () => {
            const tester = testerBuilder();
            it("should succeed with @p", () => {
                tester("@p", {
                    succeeds: true,
                    suggestions: [
                        {
                            start: 1,
                            text: "p"
                        },
                        {
                            start: 2,
                            text: "["
                        }
                    ]
                });
            });
            it("should give the suggestions for all of the selector types", () => {
                tester("@", {
                    errors: [
                        {
                            code: "parsing.expected.option",
                            range: {
                                end: 1,
                                start: 1
                            }
                        }
                    ],
                    succeeds: false,
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "p"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "r"
                        },
                        {
                            start: 1,
                            text: "s"
                        },
                        {
                            start: 1,
                            text: "e"
                        }
                    ]
                });
            });
            it("should suggest @", () => {
                tester("", {
                    succeeds: false,
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        }
                    ]
                });
            });
        });
        describe("number argument", () => {
            describe("integer", () => {
                const tester = optionTester(numOptParser(false, -12, 34, "x"))(
                    {}
                );
                it("should parse correctly", () => {
                    tester(
                        "15",
                        {
                            succeeds: true
                        },
                        {
                            x: 15
                        }
                    );
                });
                it("should fail if it is a decimal", () => {
                    tester("1.2", {
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
                it("should have errors it is below the min", () => {
                    tester("-123", {
                        errors: [
                            {
                                code: "argument.entity.option.number.belowmin",
                                range: {
                                    end: 4,
                                    start: 0
                                }
                            }
                        ],
                        succeeds: true
                    });
                });
                it("should have errors if it is above the max", () => {
                    tester("123", {
                        errors: [
                            {
                                code: "argument.entity.option.number.abovemax",
                                range: {
                                    end: 3,
                                    start: 0
                                }
                            }
                        ],
                        succeeds: true
                    });
                });
            });
            describe("float", () => {
                const tester = optionTester(
                    numOptParser(true, -12.34, 56.7, "x")
                )({});
                it("should parse correctly", () => {
                    tester(
                        "15.21",
                        {
                            succeeds: true
                        },
                        {
                            x: 15.21
                        }
                    );
                });
                it("should have errors it is below the min", () => {
                    tester("-123.45", {
                        errors: [
                            {
                                code: "argument.entity.option.number.belowmin",
                                range: {
                                    end: 7,
                                    start: 0
                                }
                            }
                        ],
                        succeeds: true
                    });
                });
                it("should have errors if it is above the max", () => {
                    tester("123", {
                        errors: [
                            {
                                code: "argument.entity.option.number.abovemax",
                                range: {
                                    end: 3,
                                    start: 0
                                }
                            }
                        ],
                        succeeds: true
                    });
                });
            });
        });
        describe("range argument", () => {
            describe("integer", () => {
                //
            });
            describe("float", () => {
                //
            });
        });
        describe("argument selector", () => {
            const tester = testerBuilder({});
            it("should succeed with no arguments", () => {
                tester("@a[]", {
                    succeeds: true,
                    suggestions: [
                        {
                            start: 3,
                            text: "]"
                        }
                    ]
                });
            });
        });
    });
});
