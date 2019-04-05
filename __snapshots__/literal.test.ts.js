exports[
    "Literal Argument Parser should correctly handle various input runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "test",
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
                            text: "test"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "test ",
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
            given: "fail ",
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
        },
        {
            given: "tesnot",
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
        },
        {
            given: "tes",
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
                            text: "test"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};
