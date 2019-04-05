exports[
    "function parser should have the correct behaviour for various inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "minecraft:test",
            expect: {
                cursor: 14,
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
                            kind: 2,
                            start: 0,
                            text: "minecraft:test"
                        },
                        {
                            kind: 2,
                            start: 0,
                            text: "minecraft:test2"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "minecraft:unknown",
            expect: {
                cursor: 17,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "arguments.function.unknown",
                            severity: 1,
                            substitutions: ["minecraft:unknown"],
                            text: "Unknown function 'minecraft:unknown'",
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
                    suggestions: [
                        {
                            kind: 2,
                            start: 0,
                            text: "minecraft:test"
                        },
                        {
                            kind: 2,
                            start: 0,
                            text: "minecraft:test2"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "#minecraft:tag",
            expect: {
                cursor: 14,
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
                            kind: 19,
                            start: 1,
                            text: "minecraft:tag"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "#minecraft:unknowntag",
            expect: {
                cursor: 21,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "arguments.function.tag.unknown",
                            severity: 1,
                            substitutions: ["minecraft:unknowntag"],
                            text:
                                "Unknown function tag '#minecraft:unknowntag'",
                            range: {
                                start: 0,
                                end: 21
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
                            kind: 19,
                            start: 1,
                            text: "minecraft:tag"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
