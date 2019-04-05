exports[
    "list tests parse() should parse all of the values correctly runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "foo",
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
                    suggestions: [
                        {
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "bar",
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
                    suggestions: [
                        {
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "baz",
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
                    suggestions: [
                        {
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "hello",
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
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "world",
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
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "++",
            expect: {
                cursor: 2,
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
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "badinput",
            expect: {
                cursor: 8,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "arg.ex",
                            severity: 1,
                            substitutions: ["badinput"],
                            text: "example error",
                            range: {
                                start: 0,
                                end: 8
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
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
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
                            code: "arg.ex",
                            severity: 1,
                            substitutions: [""],
                            text: "example error",
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
                            kind: 20,
                            start: 0,
                            text: "foo"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "bar"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "baz"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "hello"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "world"
                        },
                        {
                            kind: 20,
                            start: 0,
                            text: "++"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};
