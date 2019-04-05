exports[
    "range parser float range should do the right thing for different inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "10",
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
                            start: 0,
                            text: ".."
                        },
                        {
                            start: 2,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "..34",
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
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "12..34",
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
                            start: 0,
                            text: ".."
                        },
                        {
                            start: 3,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "..",
            expect: {
                cursor: 2,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.float.expected",
                            severity: 1,
                            substitutions: [],
                            text: "Expected float",
                            range: {
                                start: 2,
                                end: 2
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
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "7..-12",
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
                            start: 0,
                            text: ".."
                        },
                        {
                            start: 2,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "5..5",
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
                            start: 0,
                            text: ".."
                        },
                        {
                            start: 2,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "9.32",
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
                            text: ".."
                        },
                        {
                            start: 4,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "3.12..",
            expect: {
                cursor: 6,
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
                            text: ".."
                        },
                        {
                            start: 4,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "...4",
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
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "3.4..0.2",
            expect: {
                cursor: 8,
                parsing: {
                    actions: [
                        {
                            data: "0.2..3.4",
                            high: 8,
                            low: 0,
                            type: "format"
                        }
                    ],
                    errors: [
                        {
                            code: "argument.range.swapped",
                            severity: 1,
                            substitutions: [],
                            text: "Min cannot be bigger than max",
                            range: {
                                start: 0,
                                end: 8
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
                            text: ".."
                        },
                        {
                            start: 3,
                            text: ".."
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
    "range parser int range should do the right thing for different inputs runParsertest 1"
] = {
    name: "runParsertest",
    behavior: [
        {
            given: "10",
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
                            start: 0,
                            text: ".."
                        },
                        {
                            start: 2,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "..34",
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
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "12..34",
            expect: {
                cursor: 6,
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
                            text: ".."
                        },
                        {
                            start: 2,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "..",
            expect: {
                cursor: 2,
                parsing: {
                    actions: [],
                    errors: [
                        {
                            code: "parsing.int.expected",
                            severity: 1,
                            substitutions: [],
                            text: "Expected integer",
                            range: {
                                start: 2,
                                end: 2
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
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: false
                }
            }
        },
        {
            given: "7..-12",
            expect: {
                cursor: 6,
                parsing: {
                    actions: [
                        {
                            data: "-12..7",
                            high: 6,
                            low: 0,
                            type: "format"
                        }
                    ],
                    errors: [
                        {
                            code: "argument.range.swapped",
                            severity: 1,
                            substitutions: [],
                            text: "Min cannot be bigger than max",
                            range: {
                                start: 0,
                                end: 6
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
                            text: ".."
                        },
                        {
                            start: 1,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        },
        {
            given: "5..5",
            expect: {
                cursor: 4,
                parsing: {
                    actions: [
                        {
                            data: "5",
                            high: 4,
                            low: 0,
                            type: "format"
                        }
                    ],
                    errors: [
                        {
                            code: "argument.range.equal",
                            severity: 4,
                            substitutions: ["5"],
                            text:
                                "Min and max are eqaul and can be replaced by '5'",
                            range: {
                                start: 0,
                                end: 4
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
                            text: ".."
                        },
                        {
                            start: 1,
                            text: ".."
                        }
                    ],
                    misc: [],
                    kind: true
                }
            }
        }
    ]
};
