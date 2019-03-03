exports["SNBT Parser should correctly parse a compound runParsertest 1"] = {
    name: "runParsertest",
    behavior: [
        {
            given: "{foo:{bar:baz}}",
            expect: {
                cursor: 15,
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
                            text: "{"
                        },
                        {
                            start: 1,
                            text: "}"
                        },
                        {
                            start: 4,
                            text: ":"
                        },
                        {
                            start: 5,
                            text: "{"
                        },
                        {
                            start: 6,
                            text: "}"
                        },
                        {
                            start: 9,
                            text: ":"
                        },
                        {
                            start: 13,
                            text: ","
                        },
                        {
                            start: 13,
                            text: "}"
                        },
                        {
                            start: 14,
                            text: ","
                        },
                        {
                            start: 14,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};

exports[
    "SNBT Parser should return give the right results with vanilla data for a zombie runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "{",
            expect: {
                cursor: 1,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.nbt.compound.nokey",
                            severity: 1,
                            substitutions: [],
                            text: "Expected key",
                            range: {
                                start: 1,
                                end: 1
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
                            text: "{"
                        },
                        {
                            start: 1,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "{HandItems:[{",
            expect: {
                cursor: 13,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.nbt.compound.nokey",
                            severity: 1,
                            substitutions: [],
                            text: "Expected key",
                            range: {
                                start: 13,
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
                            text: "{"
                        },
                        {
                            start: 1,
                            text: "}"
                        },
                        {
                            start: 10,
                            text: ":"
                        },
                        {
                            start: 11,
                            text: "["
                        },
                        {
                            start: 12,
                            text: "]"
                        },
                        {
                            start: 12,
                            text: "{"
                        },
                        {
                            start: 13,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "{HandItems:[{display:{",
            expect: {
                cursor: 22,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.nbt.compound.nokey",
                            severity: 1,
                            substitutions: [],
                            text: "Expected key",
                            range: {
                                start: 22,
                                end: 22
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
                            text: "{"
                        },
                        {
                            start: 1,
                            text: "}"
                        },
                        {
                            start: 10,
                            text: ":"
                        },
                        {
                            start: 11,
                            text: "["
                        },
                        {
                            start: 12,
                            text: "]"
                        },
                        {
                            start: 12,
                            text: "{"
                        },
                        {
                            start: 13,
                            text: "}"
                        },
                        {
                            start: 20,
                            text: ":"
                        },
                        {
                            start: 21,
                            text: "{"
                        },
                        {
                            start: 22,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "{HandItems:[{display:{",
            expect: {
                cursor: 22,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.nbt.compound.nokey",
                            severity: 1,
                            substitutions: [],
                            text: "Expected key",
                            range: {
                                start: 22,
                                end: 22
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
                            text: "{"
                        },
                        {
                            start: 1,
                            text: "}"
                        },
                        {
                            start: 10,
                            text: ":"
                        },
                        {
                            start: 11,
                            text: "["
                        },
                        {
                            start: 12,
                            text: "]"
                        },
                        {
                            start: 12,
                            text: "{"
                        },
                        {
                            start: 13,
                            text: "}"
                        },
                        {
                            start: 20,
                            text: ":"
                        },
                        {
                            start: 21,
                            text: "{"
                        },
                        {
                            start: 22,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
