exports[
    "string-reader expect() should work correctly for various inputs expectRead 1"
] = {
    name: "expectRead",
    behavior: [
        {
            given: ["test", "t"],
            expect: {
                actions: [],
                errors: [],
                suggestions: [
                    {
                        start: 0,
                        text: "t"
                    }
                ],
                misc: [],
                kind: true
            }
        },
        {
            given: ["test", "n"],
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.expected",
                        severity: 1,
                        substitutions: ["n"],
                        text: "Expected 'n'",
                        range: {
                            start: 0,
                            end: 1
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 0,
                        text: "n"
                    }
                ],
                misc: [],
                kind: false
            }
        },
        {
            given: ["test", "tes"],
            expect: {
                actions: [],
                errors: [],
                suggestions: [
                    {
                        start: 0,
                        text: "tes"
                    }
                ],
                misc: [],
                kind: true
            }
        },
        {
            given: ["test", "not"],
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.expected",
                        severity: 1,
                        substitutions: ["not"],
                        text: "Expected 'not'",
                        range: {
                            start: 0,
                            end: 3
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 0,
                        text: "not"
                    }
                ],
                misc: [],
                kind: false
            }
        },
        {
            given: ["te", "test"],
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.expected",
                        severity: 1,
                        substitutions: ["test"],
                        text: "Expected 'test'",
                        range: {
                            start: 0,
                            end: 2
                        }
                    }
                ],
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
    ]
};

exports[
    "string-reader readBoolean() should work correctly for various inputs boolRead 1"
] = {
    name: "boolRead",
    behavior: [
        {
            given: "true",
            expect: {
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
                data: true,
                kind: true
            }
        },
        {
            given: "false",
            expect: {
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
                data: false,
                kind: true
            }
        },
        {
            given: "nonBoolean",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.bool.invalid",
                        severity: 1,
                        substitutions: ["nonBoolean"],
                        text:
                            "Invalid bool, expected true or false but found 'nonBoolean'",
                        range: {
                            start: 0,
                            end: 10
                        }
                    }
                ],
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
    ]
};

exports[
    "string-reader readFloat() should have the correct behaviour for various inputs floatReader 1"
] = {
    name: "floatReader",
    behavior: [
        {
            given: "-1000",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: -1000,
                kind: true
            }
        },
        {
            given: "1000.",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1000."],
                        text: "Invalid integer '1000.'",
                        range: {
                            start: 0,
                            end: 5
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "1000test",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 1000,
                kind: true
            }
        },
        {
            given: "noint",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.expected",
                        severity: 1,
                        substitutions: [],
                        text: "Expected integer",
                        range: {
                            start: 0,
                            end: 5
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "1.",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1."],
                        text: "Invalid integer '1.'",
                        range: {
                            start: 0,
                            end: 2
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "1000.123",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1000.123"],
                        text: "Invalid integer '1000.123'",
                        range: {
                            start: 0,
                            end: 8
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "-1000.123",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["-1000.123"],
                        text: "Invalid integer '-1000.123'",
                        range: {
                            start: 0,
                            end: 9
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "1000.123test",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1000.123"],
                        text: "Invalid integer '1000.123'",
                        range: {
                            start: 0,
                            end: 8
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "nofloat",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.expected",
                        severity: 1,
                        substitutions: [],
                        text: "Expected integer",
                        range: {
                            start: 0,
                            end: 7
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "1.1.1.1.1",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1.1.1.1.1"],
                        text: "Invalid integer '1.1.1.1.1'",
                        range: {
                            start: 0,
                            end: 9
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "0",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 0,
                kind: true
            }
        },
        {
            given: "01",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 1,
                kind: true
            }
        },
        {
            given: "012",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 12,
                kind: true
            }
        },
        {
            given: "0123",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 123,
                kind: true
            }
        },
        {
            given: "01234",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 1234,
                kind: true
            }
        }
    ]
};

exports[
    "string-reader readInt() should have the correct behaviour for various inputs intReader 1"
] = {
    name: "intReader",
    behavior: [
        {
            given: "1000.",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1000."],
                        text: "Invalid integer '1000.'",
                        range: {
                            start: 0,
                            end: 5
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "-1000",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: -1000,
                kind: true
            }
        },
        {
            given: "1000test",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 1000,
                kind: true
            }
        },
        {
            given: "noint",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.expected",
                        severity: 1,
                        substitutions: [],
                        text: "Expected integer",
                        range: {
                            start: 0,
                            end: 5
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "1.",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.int.invalid",
                        severity: 1,
                        substitutions: ["1."],
                        text: "Invalid integer '1.'",
                        range: {
                            start: 0,
                            end: 2
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "0",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 0,
                kind: true
            }
        },
        {
            given: "01",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 1,
                kind: true
            }
        },
        {
            given: "012",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 12,
                kind: true
            }
        },
        {
            given: "0123",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 123,
                kind: true
            }
        },
        {
            given: "01234",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 1234,
                kind: true
            }
        }
    ]
};

exports[
    "string-reader readOption should work correctly for various inputs optionRead 1"
] = {
    name: "optionRead",
    behavior: [
        {
            given: ["test", ["test", "other"]],
            expect: {
                actions: [],
                errors: [],
                suggestions: [
                    {
                        start: 0,
                        text: "test"
                    },
                    {
                        start: 0,
                        text: "other"
                    }
                ],
                misc: [],
                data: "test",
                kind: true
            }
        },
        {
            given: ["test", ["nottest", "other"]],
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.expected.option",
                        severity: 1,
                        substitutions: ["nottest,other", "test"],
                        text:
                            "Expected string from [nottest,other], got 'test'",
                        range: {
                            start: 0,
                            end: 4
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 0,
                        text: "nottest"
                    },
                    {
                        start: 0,
                        text: "other"
                    }
                ],
                misc: [],
                kind: false
            }
        }
    ]
};

exports[
    "string-reader readQuotedString() should have the correct behaviour on various inputs quotedStringReader 1"
] = {
    name: "quotedStringReader",
    behavior: [
        {
            given: "test",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.expected.start",
                        severity: 1,
                        substitutions: [],
                        text: "Expected quote to start a string",
                        range: {
                            start: 0,
                            end: 4
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: '"hello"',
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: "hello",
                kind: true
            }
        },
        {
            given: "'hello\"",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.expected.end",
                        severity: 1,
                        substitutions: [],
                        text: "Unclosed quoted string",
                        range: {
                            start: 0,
                            end: 7
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 7,
                        text: "'"
                    }
                ],
                misc: [],
                data: 'hello"',
                kind: false
            }
        },
        {
            given: '""',
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: "",
                kind: true
            }
        },
        {
            given: "'\"",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.expected.end",
                        severity: 1,
                        substitutions: [],
                        text: "Unclosed quoted string",
                        range: {
                            start: 0,
                            end: 2
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 2,
                        text: "'"
                    }
                ],
                misc: [],
                data: '"',
                kind: false
            }
        },
        {
            given: '"quote\\"here"',
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 'quote"here',
                kind: true
            }
        },
        {
            given: '\'quote\\"here"',
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.escape",
                        severity: 1,
                        substitutions: ['"'],
                        text:
                            "Invalid escape sequence '\\\"' in quoted string)",
                        range: {
                            start: 6,
                            end: 8
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: '"backslash\\\\here"',
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: "backslash\\here",
                kind: true
            }
        },
        {
            given: "'backslash\\\\here\"",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.expected.end",
                        severity: 1,
                        substitutions: [],
                        text: "Unclosed quoted string",
                        range: {
                            start: 0,
                            end: 17
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 17,
                        text: "'"
                    }
                ],
                misc: [],
                data: 'backslash\\here"',
                kind: false
            }
        },
        {
            given: '"oop\\s"',
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.escape",
                        severity: 1,
                        substitutions: ["s"],
                        text: "Invalid escape sequence '\\s' in quoted string)",
                        range: {
                            start: 4,
                            end: 6
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: "'oop\\s\"",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.escape",
                        severity: 1,
                        substitutions: ["s"],
                        text: "Invalid escape sequence '\\s' in quoted string)",
                        range: {
                            start: 4,
                            end: 6
                        }
                    }
                ],
                suggestions: [],
                misc: [],
                kind: false
            }
        },
        {
            given: '"trailing',
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.expected.end",
                        severity: 1,
                        substitutions: [],
                        text: "Unclosed quoted string",
                        range: {
                            start: 0,
                            end: 9
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 9,
                        text: '"'
                    }
                ],
                misc: [],
                data: "trailing",
                kind: false
            }
        },
        {
            given: "'trailing",
            expect: {
                actions: [],
                errors: [
                    {
                        code: "parsing.quote.expected.end",
                        severity: 1,
                        substitutions: [],
                        text: "Unclosed quoted string",
                        range: {
                            start: 0,
                            end: 9
                        }
                    }
                ],
                suggestions: [
                    {
                        start: 9,
                        text: "'"
                    }
                ],
                misc: [],
                data: "trailing",
                kind: false
            }
        },
        {
            given: "'quote\" in the middle'",
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: 'quote" in the middle',
                kind: true
            }
        },
        {
            given: '"quote\' in the middle"',
            expect: {
                actions: [],
                errors: [],
                suggestions: [],
                misc: [],
                data: "quote' in the middle",
                kind: true
            }
        }
    ]
};

exports[
    "string-reader readQuotedString() should return an empty string if it reading from the end 1"
] = {
    actions: [],
    errors: [],
    suggestions: [],
    misc: [],
    data: "",
    kind: true
};
