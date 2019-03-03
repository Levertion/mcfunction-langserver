exports[
    "entity parser entity selectors should parse basic selectors runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "@p",
            expect: {
                cursor: 2,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@p",
            expect: {
                cursor: 2,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@",
            expect: {
                cursor: 1,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.expected.option",
                            severity: 1,
                            substitutions: ["a,e,p,r,s", ""],
                            text: "Expected string from [a,e,p,r,s], got ''",
                            range: {
                                start: 1,
                                end: 1
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    kind: false
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
                        },
                        {
                            start: 1,
                            text: "r"
                        },
                        {
                            start: 1,
                            text: "s"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "",
            expect: {
                cursor: 0,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: false
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};

exports[
    "entity parser entity selectors should parse inputs with arguments runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "@a[]",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@e[",
            expect: {
                cursor: 3,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.argument.unknown",
                            severity: 1,
                            substitutions: [],
                            text: "Unknown argument type 'undefined'",
                            range: {
                                start: 3,
                                end: 3
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    kind: false
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 3,
                            text: "advancements"
                        },
                        {
                            start: 3,
                            text: "distance"
                        },
                        {
                            start: 3,
                            text: "dx"
                        },
                        {
                            start: 3,
                            text: "dy"
                        },
                        {
                            start: 3,
                            text: "dz"
                        },
                        {
                            start: 3,
                            text: "gamemode"
                        },
                        {
                            start: 3,
                            text: "level"
                        },
                        {
                            start: 3,
                            text: "limit"
                        },
                        {
                            start: 3,
                            text: "name"
                        },
                        {
                            start: 3,
                            text: "nbt"
                        },
                        {
                            start: 3,
                            text: "scores"
                        },
                        {
                            start: 3,
                            text: "sort"
                        },
                        {
                            start: 3,
                            text: "tag"
                        },
                        {
                            start: 3,
                            text: "team"
                        },
                        {
                            start: 3,
                            text: "type"
                        },
                        {
                            start: 3,
                            text: "x"
                        },
                        {
                            start: 3,
                            text: "x_rotation"
                        },
                        {
                            start: 3,
                            text: "y"
                        },
                        {
                            start: 3,
                            text: "y_rotation"
                        },
                        {
                            start: 3,
                            text: "z"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "@e[x=12]",
            expect: {
                cursor: 8,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 4,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "@e[x=30000000]",
            expect: {
                cursor: 14,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.number.abovemax",
                            severity: 1,
                            substitutions: ["x", "29999999"],
                            text: "Argument 'x' is greater than 29999999",
                            range: {
                                start: 5,
                                end: 13
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 4,
                            text: "="
                        },
                        {
                            start: 13,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "@p[x=10,x=13]",
            expect: {
                cursor: 13,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.duplicate",
                            severity: 1,
                            substitutions: ["x"],
                            text: "Duplicate argument 'x'",
                            range: {
                                start: 8,
                                end: 12
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 4,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "]"
                        },
                        {
                            start: 7,
                            text: ","
                        },
                        {
                            start: 9,
                            text: "="
                        },
                        {
                            start: 12,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@a[dx=123]",
            expect: {
                cursor: 10,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 5,
                            text: "="
                        },
                        {
                            start: 9,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@p[gamemode=survival]",
            expect: {
                cursor: 21,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 11,
                            text: "="
                        },
                        {
                            start: 12,
                            text: "!"
                        },
                        {
                            start: 20,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@a[gamemode=error]",
            expect: {
                cursor: 18,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.gamemode.invalid",
                            severity: 1,
                            substitutions: ["error"],
                            text: "Invalid gamemode 'error'",
                            range: {
                                start: 12,
                                end: 17
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 11,
                            text: "="
                        },
                        {
                            start: 12,
                            text: "!"
                        },
                        {
                            start: 17,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@p[gamemode=",
            expect: {
                cursor: 12,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.gamemode.expected",
                            severity: 1,
                            substitutions: [],
                            text: "Expected gamemode",
                            range: {
                                start: 12,
                                end: 12
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    kind: false
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
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
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "@a[gamemode=creative,gamemode=creative]",
            expect: {
                cursor: 39,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.noinfo",
                            severity: 1,
                            substitutions: [],
                            text: "Argument 'undefined' is redundant",
                            range: {
                                start: 30,
                                end: 38
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 11,
                            text: "="
                        },
                        {
                            start: 12,
                            text: "!"
                        },
                        {
                            start: 20,
                            text: "]"
                        },
                        {
                            start: 20,
                            text: ","
                        },
                        {
                            start: 29,
                            text: "="
                        },
                        {
                            start: 30,
                            text: "!"
                        },
                        {
                            start: 38,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@a[gamemode=survival,gamemode=!survival]",
            expect: {
                cursor: 40,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.nointersect",
                            severity: 1,
                            substitutions: ["gamemode"],
                            text: "Argument 'gamemode' cannot match any entity",
                            range: {
                                start: 30,
                                end: 39
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 11,
                            text: "="
                        },
                        {
                            start: 12,
                            text: "!"
                        },
                        {
                            start: 20,
                            text: "]"
                        },
                        {
                            start: 20,
                            text: ","
                        },
                        {
                            start: 29,
                            text: "="
                        },
                        {
                            start: 30,
                            text: "!"
                        },
                        {
                            start: 39,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@e[tag=foo]",
            expect: {
                cursor: 11,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 6,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "!"
                        },
                        {
                            start: 10,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "@a[tag=one,tag=two,tag=three]",
            expect: {
                cursor: 29,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 6,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "!"
                        },
                        {
                            start: 10,
                            text: "]"
                        },
                        {
                            start: 10,
                            text: ","
                        },
                        {
                            start: 14,
                            text: "="
                        },
                        {
                            start: 15,
                            text: "!"
                        },
                        {
                            start: 18,
                            text: "]"
                        },
                        {
                            start: 18,
                            text: ","
                        },
                        {
                            start: 22,
                            text: "="
                        },
                        {
                            start: 23,
                            text: "!"
                        },
                        {
                            start: 28,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@p[tag=foo,tag=!foo]",
            expect: {
                cursor: 20,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.nointersect",
                            severity: 1,
                            substitutions: ["tag"],
                            text: "Argument 'tag' cannot match any entity",
                            range: {
                                start: 15,
                                end: 19
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 6,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "!"
                        },
                        {
                            start: 10,
                            text: "]"
                        },
                        {
                            start: 10,
                            text: ","
                        },
                        {
                            start: 14,
                            text: "="
                        },
                        {
                            start: 15,
                            text: "!"
                        },
                        {
                            start: 19,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@r[tag=foo,tag=]",
            expect: {
                cursor: 16,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.option.nointersect",
                            severity: 1,
                            substitutions: ["type"],
                            text: "Argument 'type' cannot match any entity",
                            range: {
                                start: 15,
                                end: 15
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 6,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "!"
                        },
                        {
                            start: 10,
                            text: "]"
                        },
                        {
                            start: 10,
                            text: ","
                        },
                        {
                            start: 14,
                            text: "="
                        },
                        {
                            start: 15,
                            text: "!"
                        },
                        {
                            start: 15,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "@e[tag=]",
            expect: {
                cursor: 8,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 6,
                            text: "="
                        },
                        {
                            start: 7,
                            text: "!"
                        },
                        {
                            start: 7,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "@e[type=cow]",
            expect: {
                cursor: 12,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "cow"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "@"
                        },
                        {
                            start: 1,
                            text: "a"
                        },
                        {
                            start: 1,
                            text: "e"
                        },
                        {
                            start: 1,
                            text: "p"
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
                            start: 2,
                            text: "["
                        },
                        {
                            start: 3,
                            text: "]"
                        },
                        {
                            start: 7,
                            text: "="
                        },
                        {
                            start: 8,
                            text: "!"
                        },
                        {
                            start: 11,
                            text: "]"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "cow"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        }
    ]
};

exports["entity parser should parse UUIDS runParsertest 1"] = {
    name: "runParsertest",
    behavior: [
        {
            given: "f65c863a-747e-4fac-9828-33c3e825d00d",
            expect: {
                cursor: 36,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.uuid",
                            severity: 2,
                            substitutions: [],
                            text:
                                "Selecting an entity based on its UUID may cause instability [This warning can be disabled in the settings (Although not at the moment)]",
                            range: {
                                start: 0,
                                end: 36
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "ec-0-0-0-1",
            expect: {
                cursor: 10,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.entity.uuid",
                            severity: 2,
                            substitutions: [],
                            text:
                                "Selecting an entity based on its UUID may cause instability [This warning can be disabled in the settings (Although not at the moment)]",
                            range: {
                                start: 0,
                                end: 10
                            }
                        }
                    ],
                    suggestions: [],
                    misc: [],
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};

exports["entity parser should parse player names runParsertest 1"] = {
    name: "runParsertest",
    behavior: [
        {
            given: "FooBar",
            expect: {
                cursor: 6,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "",
            expect: {
                cursor: 0,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: false
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};

exports[
    "entity parser should suggest players in the scoreboard runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "Player1",
            expect: {
                cursor: 7,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "Player1"
                        },
                        {
                            start: 0,
                            text: "Player2"
                        }
                    ],
                    misc: [],
                    data: {
                        otherEntity: {
                            ids: [
                                {
                                    namespace: "minecraft",
                                    path: "player"
                                }
                            ]
                        }
                    },
                    kind: true
                }
            }
        },
        {
            given: "",
            expect: {
                cursor: 0,
                parsing: {
                    actions: [],
                    errors: [],
                    suggestions: [],
                    misc: [],
                    kind: false
                },
                suggesting: {
                    actions: [],
                    errors: [],
                    suggestions: [
                        {
                            start: 0,
                            text: "Player1"
                        },
                        {
                            start: 0,
                            text: "Player2"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};
