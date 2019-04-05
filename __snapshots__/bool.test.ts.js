exports[
    "Boolean Argument Parser should work correctly for various inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "true",
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
                    suggestions: [
                        {
                            start: 0,
                            text: "true"
                        },
                        {
                            start: 0,
                            text: "false"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "false",
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
                    suggestions: [
                        {
                            start: 0,
                            text: "true"
                        },
                        {
                            start: 0,
                            text: "false"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "notbool",
            expect: {
                cursor: 7,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.bool.invalid",
                            severity: 1,
                            substitutions: ["notbool"],
                            text:
                                "Invalid bool, expected true or false but found 'notbool'",
                            range: {
                                start: 0,
                                end: 7
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
                            text: "true"
                        },
                        {
                            start: 0,
                            text: "false"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "fal",
            expect: {
                cursor: 3,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.bool.invalid",
                            severity: 1,
                            substitutions: ["fal"],
                            text:
                                "Invalid bool, expected true or false but found 'fal'",
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
                            start: 0,
                            text: "true"
                        },
                        {
                            start: 0,
                            text: "false"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "tru",
            expect: {
                cursor: 3,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.bool.invalid",
                            severity: 1,
                            substitutions: ["tru"],
                            text:
                                "Invalid bool, expected true or false but found 'tru'",
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
                            start: 0,
                            text: "true"
                        },
                        {
                            start: 0,
                            text: "false"
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
                    errors: [
                        {
                            code: "parsing.bool.invalid",
                            severity: 1,
                            substitutions: [""],
                            text:
                                "Invalid bool, expected true or false but found ''",
                            range: {
                                start: 0,
                                end: 0
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
                            text: "true"
                        },
                        {
                            start: 0,
                            text: "false"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};
