exports[
    "item predicate parser should give the correct output for various inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "test:item_one",
            expect: {
                cursor: 13,
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
                            text: "test:item_one",
                            start: 0
                        },
                        {
                            text: "test:item_two",
                            start: 0
                        },
                        {
                            text: "test:item_three",
                            start: 0
                        },
                        {
                            text: "test:item_four",
                            start: 0
                        },
                        {
                            text: "test:item_four_one",
                            start: 0
                        },
                        {
                            text: "minecraft:apple",
                            start: 0
                        },
                        {
                            text: "minecraft:coal",
                            start: 0
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
            given: "#test:item_tag_one",
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
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_one"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_two"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_two_one"
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
            given: "#test:item_tag_two",
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
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_one"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_two"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_two_one"
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
            given: "#test:bad_tag",
            expect: {
                cursor: 13,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "arguments.item.tag.unknown",
                            severity: 1,
                            substitutions: ["test:bad_tag"],
                            text: "Unknown item tag 'test:bad_tag'",
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
                            text: "test:item_tag_one"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_two"
                        },
                        {
                            kind: 19,
                            start: 1,
                            text: "test:item_tag_two_one"
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
        }
    ]
};

exports[
    "item stack parser (no tags) should have the correct output for various inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "test:item_one",
            expect: {
                cursor: 13,
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
                            text: "test:item_one",
                            start: 0
                        },
                        {
                            text: "test:item_two",
                            start: 0
                        },
                        {
                            text: "test:item_three",
                            start: 0
                        },
                        {
                            text: "test:item_four",
                            start: 0
                        },
                        {
                            text: "test:item_four_one",
                            start: 0
                        },
                        {
                            text: "minecraft:apple",
                            start: 0
                        },
                        {
                            text: "minecraft:coal",
                            start: 0
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
            given: "#test:item_tag_one",
            expect: {
                cursor: 18,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.item.tag.disallowed",
                            severity: 1,
                            substitutions: [],
                            text: "Tags aren't allowed here, only actual items",
                            range: {
                                start: 0,
                                end: 18
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
            given: "#test:bad_tag",
            expect: {
                cursor: 13,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.item.tag.disallowed",
                            severity: 1,
                            substitutions: [],
                            text: "Tags aren't allowed here, only actual items",
                            range: {
                                start: 0,
                                end: 13
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
            given: "test:item_four",
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
                            text: "test:item_one",
                            start: 0
                        },
                        {
                            text: "test:item_two",
                            start: 0
                        },
                        {
                            text: "test:item_three",
                            start: 0
                        },
                        {
                            text: "test:item_four",
                            start: 0
                        },
                        {
                            text: "test:item_four_one",
                            start: 0
                        },
                        {
                            text: "minecraft:apple",
                            start: 0
                        },
                        {
                            text: "minecraft:coal",
                            start: 0
                        },
                        {
                            start: 14,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "test:bad_item",
            expect: {
                cursor: 13,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "argument.item.id.invalid",
                            severity: 1,
                            substitutions: ["test:bad_item"],
                            text: "Unknown item 'test:bad_item'",
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
                            text: "test:item_one",
                            start: 0
                        },
                        {
                            text: "test:item_two",
                            start: 0
                        },
                        {
                            text: "test:item_three",
                            start: 0
                        },
                        {
                            text: "test:item_four",
                            start: 0
                        },
                        {
                            text: "test:item_four_one",
                            start: 0
                        },
                        {
                            text: "minecraft:apple",
                            start: 0
                        },
                        {
                            text: "minecraft:coal",
                            start: 0
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
            given: "minecraft:coal",
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
                            text: "test:item_one",
                            start: 0
                        },
                        {
                            text: "test:item_two",
                            start: 0
                        },
                        {
                            text: "test:item_three",
                            start: 0
                        },
                        {
                            text: "test:item_four",
                            start: 0
                        },
                        {
                            text: "test:item_four_one",
                            start: 0
                        },
                        {
                            text: "minecraft:apple",
                            start: 0
                        },
                        {
                            text: "minecraft:coal",
                            start: 0
                        },
                        {
                            start: 14,
                            text: "{"
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
