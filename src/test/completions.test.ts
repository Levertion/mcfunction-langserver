import * as assert from "assert";
import { join } from "path";
import { CompletionItemKind, CompletionList } from "vscode-languageserver/lib/main";
import { computeCompletions } from "../completions";
import { DataManager } from "../data/manager";

const data = new DataManager({
    DummyGlobal: {
        commands: {
            children: {
                children: {
                    children: {
                        chil: {
                            type: "literal",
                        },
                        test_child: {
                            node_properties: { num: 8 },
                            parser: "langserver:dummy1",
                            type: "argument",
                        },
                    },
                    parser: "langserver:dummy1",
                    type: "argument",
                },
                nochildren: {
                    type: "literal",
                },
            },
            type: "root",
        },
    } as any,
    DummyPack: {},
});

describe("ComputeCompletions()", () => {
    before(() => {
        global.mcLangSettings = {
            parsers: {
                "langserver:dummy1": join(__dirname, "parsers", "tests", "dummy1_parser"),
            },
        } as any;
    });
    it("should get suggestions from the start of an inside node", () => {
        const result = computeCompletions(0, 15, {
            datapack_root: "",
            lines: [{
                parseInfo: {
                    actions: [], errors: [],
                    nodes: [{ low: 5, high: 15, path: ["nochildren"], final: true, context: {} }],
                },
                text: "skip nochildren",
            }],
        }, data);
        const expected: CompletionList = {
            isIncomplete: true,
            items: [{
                kind: CompletionItemKind.Method, label: "nochildren",
                textEdit: {
                    newText: "nochildren", range: { start: { line: 0, character: 5 }, end: { line: 0, character: 15 } },
                },
            }, {
                kind: CompletionItemKind.Keyword, // Default kind
                label: "welcome", textEdit: {
                    newText: "welcome", range: { start: { line: 0, character: 6 }, end: { line: 0, character: 15 } },
                },
            }, {
                kind: CompletionItemKind.Keyword, // Default kind
                label: "hello", textEdit: {
                    newText: "hello", range: { start: { line: 0, character: 5 }, end: { line: 0, character: 15 } },
                },
            }],
        };
        result.items.sort((a, b) => b.label.length - a.label.length);
        assert.deepEqual(result, expected);
    });
    it("should give suggestions which follow a final node", () => {
        const result = computeCompletions(0, 15, {
            datapack_root: "",
            lines: [{
                parseInfo: {
                    actions: [], errors: [],
                    nodes: [{ low: 0, high: 11, path: ["children"], final: true, context: {} }],
                },
                text: "haschildren chi",
            }],
        }, data);
        const expected: CompletionList = {
            isIncomplete: true,
            items: [{
                kind: CompletionItemKind.Keyword, label: "welcome", textEdit: {
                    newText: "welcome",
                    range: { end: { line: 0, character: 15 }, start: { line: 0, character: 13 } },
                },
            }, {
                kind: CompletionItemKind.Keyword, label: "hello", textEdit: {
                    newText: "hello", range: { end: { line: 0, character: 15 }, start: { line: 0, character: 12 } },
                },
            }, {
                kind: CompletionItemKind.Method,
                label: "chil", textEdit: {
                    newText: "chil", range: {
                        end: { line: 0, character: 15 },
                        start: { line: 0, character: 12 },
                    },
                },
            }],
        };
        result.items.sort((a, b) => b.label.length - a.label.length);
        assert.deepEqual(result, expected);
    });
});
