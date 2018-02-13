import * as assert from "assert";
import { GlobalData } from "../../data/types";
import { parseCommand } from "../../parse/index";
import { ParsedInfo } from "../../types";

describe("parseCommand()", () => {
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
        };

        it("should parse an executable, valid, command as such", () => {
            const result = parseCommand("hel", singleArgData);
            const expected: ParsedInfo = { errors: [], actions: [], nodes: [{ low: 0, high: 3, path: ["test1"] }] };
            assert.deepEqual(result, expected);
        });

        it("should return an error from a command which cannot be run", () => {
            const result = parseCommand("hello", singleArgData);
            const expected = {
                actions: [],
                nodes: [{ low: 0, high: 5, path: ["test2"] }],
            };
            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
            assert.equal(result.errors.length, 1);
            assert.equal(result.errors[0].code, "parsing.command.executable");
        });

        it("should add an error if there is a missing space, and not add a node", () => {
            const result = parseCommand("hel1", singleArgData);
            const expected = {
                actions: [],
                nodes: [],
            };
            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
            assert.equal(result.errors.length, 1);
            assert.equal(result.errors[0].code, "parsing.command.whitespace");
        });

        it("should add an error if there is extra text not matched by a node", () => {
            const result = parseCommand("hi", singleArgData);
            const expected = {
                actions: [],
                nodes: [],
            };
            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
            assert.equal(result.errors.length, 1);
            assert.equal(result.errors[0].code, "command.parsing.matchless");
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
        };

        it("should only add a space between nodes", () => {
            const result = parseCommand("hel hel", multiArgData);
            const expected = {
                actions: [],
                nodes: [{ high: 3, low: 0, path: ["test1"] }, {
                    high: 7, low: 4, path: ["test1", "testchild1"],
                }],
            };
            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
            assert.equal(result.errors.length, 1);
            assert.equal(result.errors[0].code, "parsing.command.executable");
        });

        it("should not add a node when the node fails.", () => {
            const result = parseCommand("hel hel1", multiArgData);
            const expected = {
                actions: [],
                nodes: [{ high: 3, low: 0, path: ["test1"] }],
            };
            const newResult: any = Object.assign({}, result);
            delete newResult.errors; // Errors are complicated to predict exactly.
            assert.deepEqual(newResult, expected);
            assert.equal(result.errors.length, 1);
            assert.equal(result.errors[0].code, "parsing.command.whitespace");
        });
    });
});
