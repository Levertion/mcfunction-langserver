import * as assert from "assert";
import {
    CompletionItemKind,
    CompletionList,
    InsertTextFormat
} from "vscode-languageserver/lib/main";
import { computeCompletions } from "../completions";
import { DataManager } from "../data/manager";
import { pack_segments } from "./blanks";
import { dummyParser } from "./parsers/tests/dummy1";

const data = DataManager.newWithData(
    {
        commands: {
            children: {
                children: {
                    children: {
                        chil: {
                            type: "literal"
                        },
                        test_child: {
                            node_properties: { num: 8 },
                            parser: "langserver:dummy1",
                            type: "argument"
                        }
                    },
                    parser: "langserver:dummy1",
                    type: "argument"
                },
                nochildren: {
                    type: "literal"
                }
            },
            type: "root"
        }
    } as any,
    {}
);

describe("ComputeCompletions()", () => {
    before(() => {
        global.mcLangSettings = {
            parsers: {
                "langserver:dummy1": dummyParser
            }
        } as any;
    });
    it("should get suggestions from the start of an inside node", () => {
        const result = computeCompletions(
            0,
            15,
            {
                lines: [
                    {
                        parseInfo: {
                            actions: [],
                            errors: [],
                            nodes: [
                                {
                                    context: {},
                                    final: true,
                                    high: 15,
                                    low: 5,
                                    path: ["nochildren"]
                                }
                            ]
                        },
                        text: "skip nochildren"
                    }
                ],
                pack_segments
            },
            data
        );
        const expected: CompletionList = {
            isIncomplete: true,
            items: [
                {
                    kind: CompletionItemKind.Method,
                    label: "nochildren",
                    textEdit: {
                        newText: "nochildren",
                        range: {
                            end: { line: 0, character: 15 },
                            start: { line: 0, character: 5 }
                        }
                    }
                },
                {
                    insertTextFormat: InsertTextFormat.PlainText,
                    kind: CompletionItemKind.Keyword,
                    label: "welcome",
                    textEdit: {
                        newText: "welcome",
                        range: {
                            end: { line: 0, character: 15 },
                            start: { line: 0, character: 6 }
                        }
                    }
                },
                {
                    kind: CompletionItemKind.Keyword,
                    label: "hello",
                    textEdit: {
                        newText: "hello",
                        range: {
                            end: { line: 0, character: 15 },
                            start: { line: 0, character: 5 }
                        }
                    }
                }
            ]
        }; // Default kind // Default kind
        result.items.sort((a, b) => b.label.length - a.label.length);
        assert.deepStrictEqual(result, expected);
    });
    it("should give suggestions which follow a final node", () => {
        const result = computeCompletions(
            0,
            15,
            {
                lines: [
                    {
                        parseInfo: {
                            actions: [],
                            errors: [],
                            nodes: [
                                {
                                    context: {},
                                    final: true,
                                    high: 11,
                                    low: 0,
                                    path: ["children"]
                                }
                            ]
                        },
                        text: "haschildren chi"
                    }
                ],
                pack_segments
            },
            data
        );
        const expected: CompletionList = {
            isIncomplete: true,
            items: [
                {
                    insertTextFormat: InsertTextFormat.PlainText,
                    kind: CompletionItemKind.Keyword,
                    label: "welcome",
                    textEdit: {
                        newText: "welcome",
                        range: {
                            end: { line: 0, character: 15 },
                            start: { line: 0, character: 13 }
                        }
                    }
                },
                {
                    kind: CompletionItemKind.Keyword,
                    label: "hello",
                    textEdit: {
                        newText: "hello",
                        range: {
                            end: { line: 0, character: 15 },
                            start: { line: 0, character: 12 }
                        }
                    }
                },
                {
                    kind: CompletionItemKind.Method,
                    label: "chil",
                    textEdit: {
                        newText: "chil",
                        range: {
                            end: { line: 0, character: 15 },
                            start: { line: 0, character: 12 }
                        }
                    }
                }
            ]
        };
        result.items.sort((a, b) => b.label.length - a.label.length);
        assert.deepStrictEqual(result, expected);
    });
});
