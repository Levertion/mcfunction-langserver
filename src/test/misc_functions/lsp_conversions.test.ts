import * as assert from "assert";
import {
    DiagnosticSeverity,
    VersionedTextDocumentIdentifier
} from "vscode-languageserver";
import {
    commandErrorToDiagnostic,
    runChanges
} from "../../misc_functions/lsp_conversions";
import { FunctionInfo } from "../../types";

describe("Language Server Conversions (Misc)", () => {
    describe("commandErrorToDiagnostic()", () => {
        it("should convert a CommandError into a valid Diagnostics", () => {
            global.mcLangSettings = {
                translation: { lang: "en-us" }
            } as McFunctionSettings;
            assert.deepStrictEqual(
                commandErrorToDiagnostic(
                    {
                        _e: "1",
                        code: "mcfunction.test",
                        range: { start: 10, end: 100 },
                        severity: DiagnosticSeverity.Error,
                        text: "test1"
                    },
                    1
                ),
                {
                    code: "mcfunction.test",
                    message: "test1",
                    range: {
                        end: { line: 1, character: 100 },
                        start: { line: 1, character: 10 }
                    },
                    severity: DiagnosticSeverity.Error,
                    source: "mcfunction"
                }
            );
        });
    });
    describe("Run Changes", () => {
        const dummyFunctionInfo = {
            datapack_root: "test"
        };
        const dummyDoc: VersionedTextDocumentIdentifier = {
            uri: "test",
            version: 1
        };
        describe("Changing One Line", () => {
            it("should work with a single changed line", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 0, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "lhello1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0]);
            });
            it("should work with a single changed line splitting into two lines", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 0, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello\nhi"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "lhello" },
                        { text: "hi1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0, 1]);
            });
            it("should work with a single changed line splitting into several lines not from the start", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 1, character: 1 }
                                },
                                text: "hello\nhi\nhelloagain"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "line1" },
                        { text: "lhello" },
                        { text: "hi" },
                        { text: "helloagain2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
        });
        describe("Changing Multiple Lines", () => {
            it("should work changing multiple lines into a single line", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [{ text: "lhello2" }, { text: "line3" }],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0]);
            });
            it("should work changing multiple lines into the same number of lines", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello\nhi"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "lhello" },
                        { text: "hi2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0, 1]);
            });
            it("should work changing multiple lines into more lines", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello\nhi\nthird"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "lhello" },
                        { text: "hi" },
                        { text: "third2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0, 1, 2]);
            });
        });
        describe("Multiple Change events", () => {
            it("should work when changing lines in order", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 0, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello"
                            },
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 1, character: 1 }
                                },
                                text: "hello2"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "lhello1" },
                        { text: "lhello22" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0, 1]);
            });
            it("should work when changing lines in reverse order", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 1, character: 1 }
                                },
                                text: "hello2"
                            },
                            {
                                range: {
                                    end: { line: 0, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [
                        { text: "lhello1" },
                        { text: "lhello22" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0, 1]);
            });
            it("should work when compressing multiple lines after the first run.", () => {
                const functionInfo: FunctionInfo = {
                    lines: [
                        { text: "line1" },
                        { text: "line2" },
                        { text: "line3" }
                    ],
                    ...dummyFunctionInfo
                };
                const result = runChanges(
                    {
                        contentChanges: [
                            {
                                range: {
                                    end: { line: 2, character: 4 },
                                    start: { line: 2, character: 1 }
                                },
                                text: "hello2"
                            },
                            {
                                range: {
                                    end: { line: 1, character: 4 },
                                    start: { line: 0, character: 1 }
                                },
                                text: "hello"
                            }
                        ],
                        textDocument: dummyDoc
                    },
                    functionInfo
                );
                assert.deepStrictEqual(functionInfo, {
                    lines: [{ text: "lhello2" }, { text: "lhello23" }],
                    ...dummyFunctionInfo
                });
                assert.deepStrictEqual(result, [0, 1]);
            });
        });
    });
});
