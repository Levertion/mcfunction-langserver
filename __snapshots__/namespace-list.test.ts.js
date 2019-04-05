exports[
    "NamespaceListParser should work correctly for various inputs runParsertest 1"
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
                            start: 0,
                            text: "minecraft:test"
                        },
                        {
                            start: 0,
                            text: "minecraft:test2"
                        },
                        {
                            start: 0,
                            text: "minecraft:other"
                        },
                        {
                            start: 0,
                            text: "something:hello"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "something:hello",
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
                            text: "minecraft:test"
                        },
                        {
                            start: 0,
                            text: "minecraft:test2"
                        },
                        {
                            start: 0,
                            text: "minecraft:other"
                        },
                        {
                            start: 0,
                            text: "something:hello"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "unknown:unknown",
            expect: {
                cursor: 15,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "namespace.test.unknown",
                            severity: 1,
                            substitutions: ["unknown:unknown"],
                            text: "Unkown",
                            range: {
                                start: 0,
                                end: 15
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
                            text: "minecraft:test"
                        },
                        {
                            start: 0,
                            text: "minecraft:test2"
                        },
                        {
                            start: 0,
                            text: "minecraft:other"
                        },
                        {
                            start: 0,
                            text: "something:hello"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "fail:fail:fail",
            expect: {
                cursor: 14,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.id.invalid",
                            severity: 1,
                            substitutions: [":", "fail:fail:fail"],
                            text:
                                "The seperator ':' should not be repeated in the ID 'fail:fail:fail'",
                            range: {
                                start: 9,
                                end: 10
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
        },
        {
            given: "",
            expect: {
                cursor: 0,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "namespace.test.unknown",
                            severity: 1,
                            substitutions: ["minecraft:"],
                            text: "Unkown",
                            range: {
                                start: 0,
                                end: 0
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
                            text: "minecraft:test"
                        },
                        {
                            start: 0,
                            text: "minecraft:test2"
                        },
                        {
                            start: 0,
                            text: "minecraft:other"
                        },
                        {
                            start: 0,
                            text: "something:hello"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
