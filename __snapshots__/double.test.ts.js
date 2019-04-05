exports[
    "Double Argument Parser valid float with `.` and space should reject a number less than the minimum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234.5678 ",
            expect: {
                cursor: 9,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.double.low",
                            severity: 1,
                            substitutions: ["1235.5678", "1234.5678"],
                            text:
                                "Float must not be less than 1235.5678, found 1234.5678",
                            range: {
                                start: 0,
                                end: 9
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
    "Double Argument Parser valid float with `.` and space should reject a number more than the maximum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234.5678 ",
            expect: {
                cursor: 9,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.double.big",
                            severity: 1,
                            substitutions: ["1233.5678", "1234.5678"],
                            text:
                                "Float must not be more than 1233.5678, found 1234.5678",
                            range: {
                                start: 0,
                                end: 9
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
    "Double Argument Parser valid float with `.` and space should succeed with no constraints runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234.5678 ",
            expect: {
                cursor: 9,
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
    "Double Argument Parser valid float with `.` should reject a number less than the minimum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234.5678",
            expect: {
                cursor: 9,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.double.low",
                            severity: 1,
                            substitutions: ["1235.5678", "1234.5678"],
                            text:
                                "Float must not be less than 1235.5678, found 1234.5678",
                            range: {
                                start: 0,
                                end: 9
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
    "Double Argument Parser valid float with `.` should reject a number more than the maximum runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234.5678",
            expect: {
                cursor: 9,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.double.big",
                            severity: 1,
                            substitutions: ["1233.5678", "1234.5678"],
                            text:
                                "Float must not be more than 1233.5678, found 1234.5678",
                            range: {
                                start: 0,
                                end: 9
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
    "Double Argument Parser valid float with `.` should succeed with no constraints runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "1234.5678",
            expect: {
                cursor: 9,
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
    "Double Argument Parser valid integer should reject a number less than the minimum runParsertest 1"
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
                            code: "argument.double.low",
                            severity: 1,
                            substitutions: ["1235", "1234"],
                            text:
                                "Float must not be less than 1235, found 1234",
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
    "Double Argument Parser valid integer should reject a number more than the maximum runParsertest 1"
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
                            code: "argument.double.big",
                            severity: 1,
                            substitutions: ["1233", "1234"],
                            text:
                                "Float must not be more than 1233, found 1234",
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
    "Double Argument Parser valid integer should succeed with no constraints runParsertest 1"
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
    "Double Argument Parser valid integer with space should reject a number less than the minimum runParsertest 1"
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
                            code: "argument.double.low",
                            severity: 1,
                            substitutions: ["1235", "1234"],
                            text:
                                "Float must not be less than 1235, found 1234",
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
    "Double Argument Parser valid integer with space should reject a number more than the maximum runParsertest 1"
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
                            code: "argument.double.big",
                            severity: 1,
                            substitutions: ["1233", "1234"],
                            text:
                                "Float must not be more than 1233, found 1234",
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
    "Double Argument Parser valid integer with space should succeed with no constraints runParsertest 1"
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
