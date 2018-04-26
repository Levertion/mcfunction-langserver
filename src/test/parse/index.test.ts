import * as assert from "assert";
import { GlobalData } from "../../data/types";
import { parseCommand } from "../../parse/index";
import { StoredParseResult } from "../../types";
import { setup_test } from "../logging_setup";
import { assertErrors } from "./parsers/utils/parser_test_utils";

describe("parseCommand()", () => {
    before(() => {
        setup_test();
    });
    describe("No command", () => {
        it("should return nothing when the string is empty", () => {
            assert.deepEqual(parseCommand("", {} as any as GlobalData),
                { actions: [], errors: [], nodes: [] });
        });
        it("should return nothing when the string is a comment", () => {
            assert.deepEqual(parseCommand("#this is a comment. I'm making a note here: ...", {} as any as GlobalData),
                { actions: [], errors: [], nodes: [] });
        });
    });
    describe("single argument tests", () => {
        const singleArgData: GlobalData = {
            commands: {
                children: {
                    test1: {
                        executable: true,
                        parser: "langserver:dummy1",
                        type: "argument",
                    },
                    test2: {
                        parser: "langserver:dummy1",
                        properties: { number: 5 },
                        type: "argument",
                    },
                },
                type: "root",
            },
        } as any;

        it("should parse an executable, valid, command as such", () => {
            const result = parseCommand("hel", singleArgData);
            const expected: StoredParseResult = { errors: [], actions: [], nodes: [{ low: 0, high: 3, path: ["test1"] }] };
            assert.deepEqual(result, expected);
        });

        it("should return an error from a command which cannot be run", () => {
            const result = parseCommand("hello", singleArgData);
            const expected = { actions: [], nodes: [{ low: 0, high: 5, path: ["test2"] }] };
            assertErrors([{ code: "parsing.command.executable", range: { start: 0, end: 5 } }], result.errors);

            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
        });

        it("should add an error if there is a missing space, and not add a node", () => {
            const result = parseCommand("hel1", singleArgData);
            const expected = { actions: [], nodes: [] };
            assertErrors([{ code: "parsing.command.whitespace", range: { start: 3, end: 4 } }], result.errors);

            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
        });

        it("should add an error if there is extra text not matched by a node", () => {
            const result = parseCommand("hi", singleArgData);
            const expected = { actions: [], nodes: [] };
            assertErrors([{ code: "command.parsing.matchless", range: { start: 0, end: 2 } }], result.errors);

            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
        });
    });
    describe("Multi Argument Tests", () => {
        const multiArgData: GlobalData = {
            commands: {
                children: {
                    test1: {
                        children: {
                            testchild1: {
                                executable: false,
                                parser: "langserver:dummy1",
                                type: "argument",
                            },
                            testchild2: {
                                parser: "langserver:dummy1",
                                properties: { number: 5 },
                                type: "argument",
                            },
                        },
                        executable: true,
                        parser: "langserver:dummy1",
                        type: "argument",
                    },
                    test2: {
                        parser: "langserver:dummy1",
                        properties: { number: 5 },
                        type: "argument",
                    },
                },
                type: "root",
            },
        } as any;

        it("should only add a space between nodes", () => {
            const result = parseCommand("hel hel", multiArgData);
            const expected = {
                actions: [],
                nodes: [{ high: 3, low: 0, path: ["test1"] }, {
                    high: 7, low: 4, path: ["test1", "testchild1"],
                }],
            };
            assertErrors([{ code: "parsing.command.executable", range: { start: 0, end: 7 } }], result.errors);

            result.nodes.sort((a, b) => a.low - b.low);
            const newResult: any = Object.assign({}, result);
            delete newResult.errors;
            assert.deepEqual(newResult, expected);
        });

        it("should not add a node when a node which is second fails", () => {
            const result = parseCommand("hel hel1", multiArgData);
            const expected = {
                actions: [],
                nodes: [{
                    final: true,
                    high: 3, low: 0, path: ["test1"],
                }],
            };
            assertErrors([{ code: "parsing.command.whitespace", range: { start: 7, end: 8 } }], result.errors);

            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
        });
    });
});
