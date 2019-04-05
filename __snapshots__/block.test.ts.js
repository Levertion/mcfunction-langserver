exports[
    "sharedBlockParser Tags allowed should correctly parse various tag inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "#test:empty",
            expect: {
                cursor: 11,
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
                            text: "test:empty"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:empty_values"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:plain"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "minecraft:empty"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "minecraft:plain"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:othertags"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:duplicated_block"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:invalid_block"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "localdata:token"
                        },
                        {
                            start: 11,
                            text: "["
                        },
                        {
                            start: 11,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "#test:unknown",
            expect: {
                cursor: 13,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "arguments.block.tag.unknown",
                            severity: 1,
                            substitutions: ["test:unknown"],
                            text: "Unknown block tag 'test:unknown'",
                            range: {
                                start: 0,
                                end: 13
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
                            text: "test:empty"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:empty_values"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:plain"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "minecraft:empty"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "minecraft:plain"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:othertags"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:duplicated_block"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:invalid_block"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "localdata:token"
                        },
                        {
                            start: 13,
                            text: "["
                        },
                        {
                            start: 13,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "#test:plain[",
            expect: {
                cursor: 12,
                parsing: {
                    actions: [
                        {
                            data:
                                '```json\n{\n    "values": [\n        "langserver:multi",\n        "langserver:props",\n        "test"\n    ]\n}\n```',
                            high: 11,
                            low: 1,
                            type: "hover"
                        }
                    ],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 11,
                                end: 12
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
                            start: 11,
                            text: "["
                        },
                        {
                            start: 12,
                            text: "]"
                        },
                        {
                            kind: 10,
                            start: 12,
                            text: "otherprop"
                        },
                        {
                            kind: 10,
                            start: 12,
                            text: "prop1"
                        },
                        {
                            kind: 10,
                            start: 12,
                            text: "prop"
                        },
                        {
                            kind: 10,
                            start: 12,
                            text: "state"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};

exports[
    "sharedBlockParser Tags allowed should work correctly for various inputs involving plain blocks runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "langserver:noprops",
            expect: {
                cursor: 18,
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
                            text: "langserver:multi",
                            start: 0
                        },
                        {
                            text: "langserver:noprops",
                            start: 0
                        },
                        {
                            text: "langserver:props",
                            start: 0
                        },
                        {
                            text: "minecraft:lang",
                            start: 0
                        },
                        {
                            text: "minecraft:test",
                            start: 0
                        },
                        {
                            start: 18,
                            text: "["
                        },
                        {
                            start: 18,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:noprops[]",
            expect: {
                cursor: 20,
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
                            start: 18,
                            text: "["
                        },
                        {
                            start: 19,
                            text: "]"
                        },
                        {
                            start: 20,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:noprops[  ]",
            expect: {
                cursor: 22,
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
                            start: 18,
                            text: "["
                        },
                        {
                            start: 21,
                            text: "]"
                        },
                        {
                            start: 22,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:props[prop=value]",
            expect: {
                cursor: 28,
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            start: 27,
                            text: ","
                        },
                        {
                            start: 27,
                            text: "]"
                        },
                        {
                            start: 28,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: 'langserver:props["prop"="value"]',
            expect: {
                cursor: 32,
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 23,
                            text: "="
                        },
                        {
                            start: 31,
                            text: ","
                        },
                        {
                            start: 31,
                            text: "]"
                        },
                        {
                            start: 32,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:props[unknown=value]",
            expect: {
                cursor: 31,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unknown",
                            severity: 1,
                            substitutions: ["langserver:props", "unknown"],
                            text:
                                "Block langserver:props does not have property 'unknown'",
                            range: {
                                start: 17,
                                end: 24
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 24,
                            text: "="
                        },
                        {
                            start: 30,
                            text: ","
                        },
                        {
                            start: 30,
                            text: "]"
                        },
                        {
                            start: 31,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:props[prop=unknown]",
            expect: {
                cursor: 30,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.invalid",
                            severity: 1,
                            substitutions: [
                                "langserver:props",
                                "unknown",
                                "prop"
                            ],
                            text:
                                "Block langserver:props does not accept 'unknown' for prop property",
                            range: {
                                start: 22,
                                end: 29
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            start: 29,
                            text: ","
                        },
                        {
                            start: 29,
                            text: "]"
                        },
                        {
                            start: 30,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[otherprop=propvalue,prop1=other]",
            expect: {
                cursor: 49,
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 26,
                            text: "="
                        },
                        {
                            start: 36,
                            text: ","
                        },
                        {
                            start: 42,
                            text: "="
                        },
                        {
                            start: 48,
                            text: ","
                        },
                        {
                            start: 48,
                            text: "]"
                        },
                        {
                            start: 49,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[otherprop=propvalue,otherprop=lang]",
            expect: {
                cursor: 52,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.duplicate",
                            severity: 1,
                            substitutions: ["otherprop", "langserver:multi"],
                            text:
                                "Property 'otherprop' can only be set once for block langserver:multi",
                            range: {
                                start: 37,
                                end: 46
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 26,
                            text: "="
                        },
                        {
                            start: 36,
                            text: ","
                        },
                        {
                            start: 46,
                            text: "="
                        },
                        {
                            start: 51,
                            text: ","
                        },
                        {
                            start: 51,
                            text: "]"
                        },
                        {
                            start: 52,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[otherprop=lang",
            expect: {
                cursor: 31,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 31
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 26,
                            text: "="
                        },
                        {
                            kind: 20,
                            start: 27,
                            text: "lang"
                        },
                        {
                            kind: 20,
                            start: 27,
                            text: "propvalue"
                        },
                        {
                            start: 31,
                            text: ","
                        },
                        {
                            start: 31,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:",
            expect: {
                cursor: 11,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.id.invalid",
                            severity: 1,
                            substitutions: [],
                            text: "Unknown block type 'undefined'",
                            range: {
                                start: 0,
                                end: 11
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
                            text: "langserver:multi",
                            start: 0
                        },
                        {
                            text: "langserver:noprops",
                            start: 0
                        },
                        {
                            text: "langserver:props",
                            start: 0
                        },
                        {
                            text: "minecraft:lang",
                            start: 0
                        },
                        {
                            text: "minecraft:test",
                            start: 0
                        },
                        {
                            start: 11,
                            text: "["
                        },
                        {
                            start: 11,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "lang",
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
                            text: "langserver:multi",
                            start: 0
                        },
                        {
                            text: "langserver:noprops",
                            start: 0
                        },
                        {
                            text: "langserver:props",
                            start: 0
                        },
                        {
                            text: "minecraft:lang",
                            start: 0
                        },
                        {
                            text: "minecraft:test",
                            start: 0
                        },
                        {
                            start: 4,
                            text: "["
                        },
                        {
                            start: 4,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[",
            expect: {
                cursor: 17,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 17
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            kind: 10,
                            start: 17,
                            text: "otherprop"
                        },
                        {
                            kind: 10,
                            start: 17,
                            text: "prop1"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:props[prop",
            expect: {
                cursor: 21,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.novalue",
                            severity: 1,
                            substitutions: ["prop", "langserver:props"],
                            text:
                                "Expected value for property 'prop' on block langserver:props",
                            range: {
                                start: 17,
                                end: 21
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            kind: 10,
                            start: 17,
                            text: "prop"
                        },
                        {
                            start: 21,
                            text: "="
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: 'langserver:props["prop"extra',
            expect: {
                cursor: 23,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.novalue",
                            severity: 1,
                            substitutions: ["prop", "langserver:props"],
                            text:
                                "Expected value for property 'prop' on block langserver:props",
                            range: {
                                start: 17,
                                end: 23
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 23,
                            text: "="
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:props[prop=",
            expect: {
                cursor: 22,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 22
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value2"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "other"
                        },
                        {
                            start: 22,
                            text: ","
                        },
                        {
                            start: 22,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:props[prop=val",
            expect: {
                cursor: 25,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.invalid",
                            severity: 1,
                            substitutions: ["langserver:props", "val", "prop"],
                            text:
                                "Block langserver:props does not accept 'val' for prop property",
                            range: {
                                start: 22,
                                end: 25
                            }
                        },
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 25
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value2"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "other"
                        },
                        {
                            start: 25,
                            text: ","
                        },
                        {
                            start: 25,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};

exports[
    "sharedBlockParser Tags not allowed should do the right thing when tags are provided runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "#minecraft:anything",
            expect: {
                cursor: 19,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.tag.disallowed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Tags aren't allowed here, only actual blocks",
                            range: {
                                start: 0,
                                end: 19
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
            given: "#minecraft:anything[anyprop=value]",
            expect: {
                cursor: 19,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.tag.disallowed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Tags aren't allowed here, only actual blocks",
                            range: {
                                start: 0,
                                end: 19
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
    "sharedBlockParser Tags not allowed should work correctly for various inputs involving plain blocks runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "langserver:noprops",
            expect: {
                cursor: 18,
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
                            text: "langserver:multi",
                            start: 0
                        },
                        {
                            text: "langserver:noprops",
                            start: 0
                        },
                        {
                            text: "langserver:props",
                            start: 0
                        },
                        {
                            text: "minecraft:lang",
                            start: 0
                        },
                        {
                            text: "minecraft:test",
                            start: 0
                        },
                        {
                            start: 18,
                            text: "["
                        },
                        {
                            start: 18,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:noprops[]",
            expect: {
                cursor: 20,
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
                            start: 18,
                            text: "["
                        },
                        {
                            start: 19,
                            text: "]"
                        },
                        {
                            start: 20,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:noprops[  ]",
            expect: {
                cursor: 22,
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
                            start: 18,
                            text: "["
                        },
                        {
                            start: 21,
                            text: "]"
                        },
                        {
                            start: 22,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:props[prop=value]",
            expect: {
                cursor: 28,
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            start: 27,
                            text: ","
                        },
                        {
                            start: 27,
                            text: "]"
                        },
                        {
                            start: 28,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: 'langserver:props["prop"="value"]',
            expect: {
                cursor: 32,
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 23,
                            text: "="
                        },
                        {
                            start: 31,
                            text: ","
                        },
                        {
                            start: 31,
                            text: "]"
                        },
                        {
                            start: 32,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:props[unknown=value]",
            expect: {
                cursor: 31,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unknown",
                            severity: 1,
                            substitutions: ["langserver:props", "unknown"],
                            text:
                                "Block langserver:props does not have property 'unknown'",
                            range: {
                                start: 17,
                                end: 24
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 24,
                            text: "="
                        },
                        {
                            start: 30,
                            text: ","
                        },
                        {
                            start: 30,
                            text: "]"
                        },
                        {
                            start: 31,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:props[prop=unknown]",
            expect: {
                cursor: 30,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.invalid",
                            severity: 1,
                            substitutions: [
                                "langserver:props",
                                "unknown",
                                "prop"
                            ],
                            text:
                                "Block langserver:props does not accept 'unknown' for prop property",
                            range: {
                                start: 22,
                                end: 29
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            start: 29,
                            text: ","
                        },
                        {
                            start: 29,
                            text: "]"
                        },
                        {
                            start: 30,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[otherprop=propvalue,prop1=other]",
            expect: {
                cursor: 49,
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 26,
                            text: "="
                        },
                        {
                            start: 36,
                            text: ","
                        },
                        {
                            start: 42,
                            text: "="
                        },
                        {
                            start: 48,
                            text: ","
                        },
                        {
                            start: 48,
                            text: "]"
                        },
                        {
                            start: 49,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[otherprop=propvalue,otherprop=lang]",
            expect: {
                cursor: 52,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.duplicate",
                            severity: 1,
                            substitutions: ["otherprop", "langserver:multi"],
                            text:
                                "Property 'otherprop' can only be set once for block langserver:multi",
                            range: {
                                start: 37,
                                end: 46
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 26,
                            text: "="
                        },
                        {
                            start: 36,
                            text: ","
                        },
                        {
                            start: 46,
                            text: "="
                        },
                        {
                            start: 51,
                            text: ","
                        },
                        {
                            start: 51,
                            text: "]"
                        },
                        {
                            start: 52,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[otherprop=lang",
            expect: {
                cursor: 31,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 31
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 26,
                            text: "="
                        },
                        {
                            kind: 20,
                            start: 27,
                            text: "lang"
                        },
                        {
                            kind: 20,
                            start: 27,
                            text: "propvalue"
                        },
                        {
                            start: 31,
                            text: ","
                        },
                        {
                            start: 31,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:",
            expect: {
                cursor: 11,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.id.invalid",
                            severity: 1,
                            substitutions: [],
                            text: "Unknown block type 'undefined'",
                            range: {
                                start: 0,
                                end: 11
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
                            text: "langserver:multi",
                            start: 0
                        },
                        {
                            text: "langserver:noprops",
                            start: 0
                        },
                        {
                            text: "langserver:props",
                            start: 0
                        },
                        {
                            text: "minecraft:lang",
                            start: 0
                        },
                        {
                            text: "minecraft:test",
                            start: 0
                        },
                        {
                            start: 11,
                            text: "["
                        },
                        {
                            start: 11,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "lang",
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
                            text: "langserver:multi",
                            start: 0
                        },
                        {
                            text: "langserver:noprops",
                            start: 0
                        },
                        {
                            text: "langserver:props",
                            start: 0
                        },
                        {
                            text: "minecraft:lang",
                            start: 0
                        },
                        {
                            text: "minecraft:test",
                            start: 0
                        },
                        {
                            start: 4,
                            text: "["
                        },
                        {
                            start: 4,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:multi[",
            expect: {
                cursor: 17,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 17
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            kind: 10,
                            start: 17,
                            text: "otherprop"
                        },
                        {
                            kind: 10,
                            start: 17,
                            text: "prop1"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:props[prop",
            expect: {
                cursor: 21,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.novalue",
                            severity: 1,
                            substitutions: ["prop", "langserver:props"],
                            text:
                                "Expected value for property 'prop' on block langserver:props",
                            range: {
                                start: 17,
                                end: 21
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            kind: 10,
                            start: 17,
                            text: "prop"
                        },
                        {
                            start: 21,
                            text: "="
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: 'langserver:props["prop"extra',
            expect: {
                cursor: 23,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.novalue",
                            severity: 1,
                            substitutions: ["prop", "langserver:props"],
                            text:
                                "Expected value for property 'prop' on block langserver:props",
                            range: {
                                start: 17,
                                end: 23
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 23,
                            text: "="
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:props[prop=",
            expect: {
                cursor: 22,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 22
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value2"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "other"
                        },
                        {
                            start: 22,
                            text: ","
                        },
                        {
                            start: 22,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "langserver:props[prop=val",
            expect: {
                cursor: 25,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.block.property.invalid",
                            severity: 1,
                            substitutions: ["langserver:props", "val", "prop"],
                            text:
                                "Block langserver:props does not accept 'val' for prop property",
                            range: {
                                start: 22,
                                end: 25
                            }
                        },
                        {
                            code: "argument.block.property.unclosed",
                            severity: 1,
                            substitutions: [],
                            text:
                                "Expected closing ] for block state properties",
                            range: {
                                start: 16,
                                end: 25
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
                            start: 16,
                            text: "["
                        },
                        {
                            start: 17,
                            text: "]"
                        },
                        {
                            start: 21,
                            text: "="
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "value2"
                        },
                        {
                            kind: 20,
                            start: 22,
                            text: "other"
                        },
                        {
                            start: 25,
                            text: ","
                        },
                        {
                            start: 25,
                            text: "]"
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        }
    ]
};

exports[
    "sharedBlockParser block & NBT tests should work correctly for various input with nbt runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: 'langserver:nbt{customTag:"Hello World"}',
            expect: {
                cursor: 39,
                parsing: {
                    actions: [
                        {
                            data: "(compound) ",
                            high: 15,
                            low: 14,
                            type: "hover"
                        },
                        {
                            data: "(string) ",
                            high: 38,
                            low: 25,
                            type: "hover"
                        },
                        {
                            data: "(string) ",
                            high: 24,
                            low: 15,
                            type: "hover"
                        },
                        {
                            data: "(compound) ",
                            high: 39,
                            low: 38,
                            type: "hover"
                        }
                    ],
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
                            start: 14,
                            text: "["
                        },
                        {
                            start: 14,
                            text: "{"
                        },
                        {
                            start: 15,
                            text: "}"
                        },
                        {
                            start: 24,
                            text: ":"
                        },
                        {
                            start: 38,
                            text: ","
                        },
                        {
                            start: 38,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: 'langserver:nbt{customTag:"Hello World"}',
            expect: {
                cursor: 39,
                parsing: {
                    actions: [
                        {
                            data: "(compound) ",
                            high: 15,
                            low: 14,
                            type: "hover"
                        },
                        {
                            data: "(string) ",
                            high: 38,
                            low: 25,
                            type: "hover"
                        },
                        {
                            data: "(string) ",
                            high: 24,
                            low: 15,
                            type: "hover"
                        },
                        {
                            data: "(compound) ",
                            high: 39,
                            low: 38,
                            type: "hover"
                        }
                    ],
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
                            start: 14,
                            text: "["
                        },
                        {
                            start: 14,
                            text: "{"
                        },
                        {
                            start: 15,
                            text: "}"
                        },
                        {
                            start: 24,
                            text: ":"
                        },
                        {
                            start: 38,
                            text: ","
                        },
                        {
                            start: 38,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: 'langserver:nbt_prop[prop=1]{customTag:"Hello World"}',
            expect: {
                cursor: 52,
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
                            start: 19,
                            text: "["
                        },
                        {
                            start: 20,
                            text: "]"
                        },
                        {
                            start: 24,
                            text: "="
                        },
                        {
                            start: 26,
                            text: ","
                        },
                        {
                            start: 26,
                            text: "]"
                        },
                        {
                            start: 27,
                            text: "{"
                        },
                        {
                            start: 28,
                            text: "}"
                        },
                        {
                            start: 37,
                            text: ":"
                        },
                        {
                            start: 51,
                            text: ","
                        },
                        {
                            start: 51,
                            text: "}"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:nbt{",
            expect: {
                cursor: 15,
                parsing: {
                    actions: [
                        {
                            data: "(compound) ",
                            high: 15,
                            low: 14,
                            type: "hover"
                        }
                    ],
                    errors: [
                        {
                            code: "argument.nbt.compound.nokey",
                            severity: 1,
                            substitutions: [],
                            text: "Expected key",
                            range: {
                                start: 15,
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
                            start: 14,
                            text: "["
                        },
                        {
                            start: 14,
                            text: "{"
                        },
                        {
                            start: 15,
                            text: "}"
                        },
                        {
                            description: "(string) ",
                            kind: 5,
                            label: "customTag",
                            start: 15,
                            text: "customTag"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:nbt_two",
            expect: {
                cursor: 18,
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
                            text: "langserver:nbt",
                            start: 0
                        },
                        {
                            text: "langserver:nbt_prop",
                            start: 0
                        },
                        {
                            text: "langserver:nbt_two",
                            start: 0
                        },
                        {
                            start: 18,
                            text: "["
                        },
                        {
                            start: 18,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "langserver:nbt_two{",
            expect: {
                cursor: 19,
                parsing: {
                    actions: [
                        {
                            data: "(compound) ",
                            high: 19,
                            low: 18,
                            type: "hover"
                        }
                    ],
                    errors: [
                        {
                            code: "argument.nbt.compound.nokey",
                            severity: 1,
                            substitutions: [],
                            text: "Expected key",
                            range: {
                                start: 19,
                                end: 19
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
                            start: 18,
                            text: "["
                        },
                        {
                            start: 18,
                            text: "{"
                        },
                        {
                            start: 19,
                            text: "}"
                        },
                        {
                            description: "(int) ",
                            kind: 5,
                            label: "key1",
                            start: 19,
                            text: "key1"
                        },
                        {
                            description: "(string) ",
                            kind: 5,
                            label: "key0",
                            start: 19,
                            text: "key0"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
