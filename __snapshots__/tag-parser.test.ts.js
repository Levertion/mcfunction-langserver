exports["SNBT Tag Parsers Byte Tag should parse correctly testTagInner 1"] = {
    name: "testTagInner",
    behavior: [
        {
            given: "123b",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        },
        {
            given: "321s",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        },
        {
            given: "hello",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.float.expected",
                        severity: 1,
                        substitutions: [],
                        text: "Expected float",
                        range: {
                            start: 0,
                            end: 5
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                data: 0,
                kind: false
            }
        },
        {
            given: "true",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        },
        {
            given: "false",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        },
        {
            given: "130b",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        },
        {
            given: "-10b",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        },
        {
            given: "-130b",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 2,
                kind: true
            }
        }
    ]
};
