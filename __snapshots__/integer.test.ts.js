exports[
    "Integer Argument Parser should fail when the integer is bigger than the java max runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1000000000000000",
            expect: {
                cursor: 16,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.integer.big",
                            severity: 1,
                            substitutions: ["2147483647", "1000000000000000"],
                            text:
                                "Integer must not be more than 2147483647, found 1000000000000000",
                            range: {
                                start: 0,
                                end: 16
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
    "Integer Argument Parser should fail when the integer is less than the java min runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "-1000000000000000",
            expect: {
                cursor: 17,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.integer.low",
                            severity: 1,
                            substitutions: ["-2147483648", "-1000000000000000"],
                            text:
                                "Integer must not be less than -2147483648, found -1000000000000000",
                            range: {
                                start: 0,
                                end: 17
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
    "Integer Argument Parser should fail when there is an invalid integer runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "notint",
            expect: {
                cursor: 0,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.int.expected",
                            severity: 1,
                            substitutions: [],
                            text: "Expected integer",
                            range: {
                                start: 0,
                                end: 6
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
    "Integer Argument Parser valid integer should fail with a value less than the minimum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.integer.low",
                            severity: 1,
                            substitutions: ["1235", "1234"],
                            text:
                                "Integer must not be less than 1235, found 1234",
                            range: {
                                start: 0,
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
        }
    ]
};

exports[
    "Integer Argument Parser valid integer should fail with a value more than the maximum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.integer.big",
                            severity: 1,
                            substitutions: ["1233", "1234"],
                            text:
                                "Integer must not be more than 1233, found 1234",
                            range: {
                                start: 0,
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
        }
    ]
};

exports[
    "Integer Argument Parser valid integer should succeed with an unconstrained value runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234",
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
        }
    ]
};

exports[
    "Integer Argument Parser valid integer with space should fail with a value less than the minimum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234 ",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.integer.low",
                            severity: 1,
                            substitutions: ["1235", "1234"],
                            text:
                                "Integer must not be less than 1235, found 1234",
                            range: {
                                start: 0,
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
        }
    ]
};

exports[
    "Integer Argument Parser valid integer with space should fail with a value more than the maximum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234 ",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.integer.big",
                            severity: 1,
                            substitutions: ["1233", "1234"],
                            text:
                                "Integer must not be more than 1233, found 1234",
                            range: {
                                start: 0,
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
        }
    ]
};

exports[
    "Integer Argument Parser valid integer with space should succeed with an unconstrained value runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234 ",
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
        }
    ]
};
