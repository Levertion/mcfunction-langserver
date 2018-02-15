import * as assert from "assert";
import { CompletionItemKind, CompletionList } from "vscode-languageserver/lib/main";
import { ComputeCompletions } from "../completions";
import { DataManager } from "../data/manager";
import { CommandLine } from "../types";

describe("ComputeCompletions()", () => {
    it("should replace an internal node", () => {
        const result = ComputeCompletions(0, {
            datapack_root: "",
            lines: [{
                parseInfo: {
                    nodes: [{ low: 0, high: 9, path: ["test1"] }],
                },
                text: "longhello",
            } as any as CommandLine],
        }, 9,
            new DataManager({
                DummyGlobal: {
                    commands: {
                        children: {
                            test1: {
                                parser: "langserver:dummy1",
                                type: "argument",
                            },
                        },
                        type: "root",
                    },
                },
            }));
        const expected: CompletionList = {
            isIncomplete: true,
            items: [{
                kind: CompletionItemKind.Keyword,
                label: "hello",
                textEdit: {
                    newText: "hello",
                    range: {
                        end: { line: 0, character: 9 },
                        start: { line: 0, character: 0 },
                    },
                },
            }, {
                detail: undefined, // Quirk of the system.
                kind: CompletionItemKind.Constructor,
                label: "test",
                textEdit: {
                    newText: "test",
                    range: {
                        end: { line: 0, character: 9 },
                        start: { line: 0, character: 2 },
                    },
                },
            }],
        };
        result.items.sort((a, b) => b.label.length - a.label.length);
        assert.deepEqual(result, expected);
    });
    it("should do completions from after a final node", () => {
        const result = ComputeCompletions(0, {
            datapack_root: "",
            lines: [{
                parseInfo: {
                    nodes: [{ low: 0, high: 3, path: ["test1"], final: true }],
                },
                text: "lon ghello",
            } as any as CommandLine],
        }, 9,
            new DataManager({
                DummyGlobal: {
                    commands: {
                        children: {
                            test1: {
                                children: {
                                    test2: {
                                        parser: "langserver:dummy1",
                                        type: "argument",
                                    },
                                },
                                parser: "langserver:dummy1",
                                type: "argument",
                            },
                        },
                        type: "root",
                    },
                },
            }));
        const expected: CompletionList = {
            isIncomplete: true,
            items: [{
                kind: CompletionItemKind.Keyword,
                label: "hello",
                textEdit: {
                    newText: "hello",
                    range: {
                        end: { line: 0, character: 9 },
                        start: { line: 0, character: 4 },
                    },
                },
            }, {
                detail: undefined, // Quirk of the system.
                kind: CompletionItemKind.Constructor,
                label: "test",
                textEdit: {
                    newText: "test",
                    range: {
                        end: { line: 0, character: 9 },
                        start: { line: 0, character: 6 },
                    },
                },
            }],
        };
        result.items.sort((a, b) => b.label.length - a.label.length);
        assert.deepEqual(result, expected);
    });
});
