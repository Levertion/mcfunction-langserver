exports[
    "Coordinate tests should work for various inputs with settings: {count: 2, float: false, local: true } runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "~1 ~",
            expect: {
                cursor: 4,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "2 3",
            expect: {
                cursor: 3,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "5 ~",
            expect: {
                cursor: 3,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "~ ~",
            expect: {
                cursor: 3,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "1 ^4",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.pos.mixed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Cannot mix world & local coordinates (everything must either use ^ or not)",
                            range: {
                                start: 2,
                                end: 4
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
            given: "~1 ^4",
            expect: {
                cursor: 5,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.pos.mixed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Cannot mix world & local coordinates (everything must either use ^ or not)",
                            range: {
                                start: 3,
                                end: 5
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
            given: "~2 ",
            expect: {
                cursor: 3,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.pos.incomplete",
                            severity: 1,
                            substitutions: ["1", "2"],
                            text:
                                "Incomplete position argument. Only 1 coords are present, when 2 should be",
                            range: {
                                start: 0,
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
                            start: 3,
                            text: "~"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "1.3 1",
            expect: {
                cursor: 3,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.int.invalid",
                            severity: 1,
                            substitutions: ["1.3"],
                            text: "Invalid integer '1.3'",
                            range: {
                                start: 0,
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
                    suggestions: [],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};

exports[
    "Coordinate tests should work for various inputs with settings: {count: 2, float: true , local: false} runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "~1 ~",
            expect: {
                cursor: 4,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "2 3",
            expect: {
                cursor: 3,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "5 ~20",
            expect: {
                cursor: 5,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "~ ~",
            expect: {
                cursor: 3,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "^ ^3",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.pos.nolocal",
                            severity: 1,
                            substitutions: [],
                            text: "Local coords are not allowed",
                            range: {
                                start: 0,
                                end: 1
                            }
                        },
                        {
                            code: "argument.pos.nolocal",
                            severity: 1,
                            substitutions: [],
                            text: "Local coords are not allowed",
                            range: {
                                start: 2,
                                end: 3
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

exports[
    "Coordinate tests should work for various inputs with settings: {count: 3, float: true , local: true } runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1 2 3",
            expect: {
                cursor: 5,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "~1 ~2 3",
            expect: {
                cursor: 7,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "^1 ^ ^2",
            expect: {
                cursor: 7,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "~ ~ ~",
            expect: {
                cursor: 5,
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "1.2 3 ~1",
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "^.1 ^ ^3",
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
                    suggestions: [],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
