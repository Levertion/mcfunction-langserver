exports[
    "String Argument Parser should work for a phrase string runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: 'test space :"-)(*',
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
            given: '"quote test" :"-)(*',
            expect: {
                cursor: 12,
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
    "String Argument Parser should work for a word string runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: 'test space :"-)(*',
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
            given: '"quote test" :"-)(*',
            expect: {
                cursor: 0,
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
    "String Argument Parser should work with a greedy string runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: 'test space :"-)(*',
            expect: {
                cursor: 17,
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
