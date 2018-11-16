import { NBTNode } from "mc-nbt-paths";
import { EntityBase } from "../../../parsers/minecraft/entity";
import { CommandData } from "../../../types";
import { testParser } from "../../assertions";

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
        describe("argument selector", () => {
            const tester = testerBuilder({
                data: {
                    globalData: {
                        nbt_docs: new Map<string, NBTNode>([
                            [
                                "root.json",
                                {
                                    children: {
                                        "minecraft:cow": {
                                            children: {
                                                foo: {
                                                    type: "string"
                                                }
                                            },
                                            type: "compound"
                                        },
                                        none: {
                                            children: {
                                                key: {
                                                    type: "string"
                                                }
                                            },
                                            type: "compound"
                                        }
                                    },
                                    type: "root"
                                }
                            ]
                        ])
                    }
                } as CommandData
            });
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
            it("should fail if there isn't a closing bracket", () => {
                tester("@e[", {
                    errors: [
                        {
                            code: "argument.entity.option.noopt",
                            range: {
                                end: 3,
                                start: 0
                            }
                        }
                    ],
                    succeeds: false,
                    suggestions: [
                        {
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        }
                    ]
                });
            });
            describe("x, y, z", () => {
                it("should succeed with a coord argument", () => {
                    tester("@e[x=12]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 7,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add errors if the coord is out of bounds", () => {
                    tester("@e[x=30000000]", {
                        errors: [
                            {
                                code: "argument.entity.option.number.abovemax",
                                range: {
                                    end: 13,
                                    start: 5
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 13,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add errors if the arg is already present", () => {
                    tester("@p[x=10,x=13]", {
                        errors: [
                            {
                                code: "argument.entity.option.duplicate",
                                range: {
                                    end: 12,
                                    start: 8
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 12,
                                text: "]"
                            }
                        ]
                    });
                });
            });
            describe("dx, dy, dz", () => {
                it("should succeed with a distance argument", () => {
                    tester("@a[dx=123]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 9,
                                text: "]"
                            }
                        ]
                    });
                });
            });
            describe("gamemode", () => {
                it("should parse correctly", () => {
                    tester("@p[gamemode=survival]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 20,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add errors when using an incorrect option", () => {
                    tester("@a[gamemode=error]", {
                        errors: [
                            {
                                code: "argument.entity.option.gamemode.invalid",
                                range: {
                                    end: 17,
                                    start: 12
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 17,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add all of the correct suggestions", () => {
                    tester("@p[gamemode=", {
                        errors: [
                            {
                                code:
                                    "argument.entity.option.gamemode.expected",
                                range: {
                                    end: 12,
                                    start: 12
                                }
                            }
                        ],
                        succeeds: false,
                        suggestions: [
                            {
                                start: 11,
                                text: "="
                            },
                            {
                                start: 12,
                                text: "!"
                            },
                            {
                                start: 12,
                                text: "survival"
                            },
                            {
                                start: 12,
                                text: "creative"
                            },
                            {
                                start: 12,
                                text: "adventure"
                            },
                            {
                                start: 12,
                                text: "spectator"
                            }
                        ]
                    });
                });
                it("should add errors when an argument is a duplicate", () => {
                    tester("@a[gamemode=creative,gamemode=creative]", {
                        errors: [
                            {
                                code: "argument.entity.option.noinfo",
                                range: {
                                    end: 38,
                                    start: 30
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 38,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add errors when an argument is impossible", () => {
                    tester("@a[gamemode=survival,gamemode=!survival]", {
                        errors: [
                            {
                                code: "argument.entity.option.nointersect",
                                range: {
                                    end: 39,
                                    start: 30
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 39,
                                text: "]"
                            }
                        ]
                    });
                });
            });
            describe("tag", () => {
                it("should be valid with one tag", () => {
                    tester("@e[tag=foo]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 10,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should be valid with many tags", () => {
                    tester("@a[tag=one,tag=two,tag=three]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 28,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add errors if there is conflicting specific tags", () => {
                    tester("@p[tag=foo,tag=!foo]", {
                        errors: [
                            {
                                code: "argument.entity.option.nointersect",
                                range: {
                                    end: 19,
                                    start: 15
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 19,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should add errors if there is tags but there cannot be any tags", () => {
                    tester("@r[tag=foo,tag=!]", {
                        errors: [
                            {
                                code: "argument.entity.option.nointersect",
                                range: {
                                    end: 16,
                                    start: 15
                                }
                            }
                        ],
                        succeeds: true,
                        suggestions: [
                            {
                                start: 16,
                                text: "]"
                            }
                        ]
                    });
                });
                it("should not add an error if there is a blank tag (not inverted)", () => {
                    tester("@e[tag=]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 7,
                                text: "]"
                            }
                        ]
                    });
                });
            });
            describe("type", () => {
                it("should parse correctly", () => {
                    tester("@e[type=cow]", {
                        succeeds: true,
                        suggestions: [
                            {
                                start: 11,
                                text: "]"
                            }
                        ]
                    });
                });
            });
        });
    });
});
