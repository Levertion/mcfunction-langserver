import * as assert from "assert";

import { GlobalData } from "../data/types";
import { parseCommand } from "../parse";
import { ParseNode, StoredParseResult } from "../types";

import { snapshot } from "./assertions";
import { dummyParser } from "./parsers/tests/dummy1";

const fakeGlobal: GlobalData = {} as any;

function assertParse(res: StoredParseResult | void, nodes: ParseNode[]): void {
    assert.notStrictEqual(res, undefined);
    const result = (res as any) as StoredParseResult;
    if (res) {
        snapshot(res);
    }
    const newNodes = result.nodes.slice();
    for (const node of nodes) {
        assert(
            newNodes.find((v, i, s) => {
                try {
                    assert.deepStrictEqual(v, node);
                    s.splice(i, 1);
                    return true;
                } catch (error) {
                    return false;
                }
            })
        );
    }
    assert.strictEqual(newNodes.length, 0);
}

describe("parseCommand()", () => {
    before(() => {
        global.mcLangSettings = {
            parsers: {
                "langserver:dummy1": dummyParser
            }
        } as any;
    });
    after(() => {
        delete global.mcLangSettings;
    });
    describe("No command", () => {
        it("should return nothing when the string is empty", () => {
            assert.strictEqual(
                parseCommand("", fakeGlobal, undefined),
                undefined
            );
        });
        it("should return nothing when the string is a comment", () => {
            assert.strictEqual(
                parseCommand("#this is a comment", fakeGlobal, undefined),
                undefined
            );
        });
        it("should return nothing when the string is only whitespace", () => {
            assert.strictEqual(
                parseCommand("     ", fakeGlobal, undefined),
                undefined
            );
        });
        it("should return nothing when the string is whitespace followed by a comment", () => {
            assert.strictEqual(
                parseCommand("     #this is a comment", fakeGlobal, undefined),
                undefined
            );
        });
    });
    describe("single argument tests", () => {
        const singleArgData: GlobalData = {
            commands: {
                children: {
                    test1: {
                        executable: true,
                        parser: "langserver:dummy1",
                        type: "argument"
                    },
                    test2: {
                        parser: "langserver:dummy1",
                        properties: { number: 5 },
                        type: "argument"
                    }
                },
                type: "root"
            }
        } as any;

        it("should parse an executable, valid, command as such", () => {
            const result = parseCommand("hel", singleArgData, undefined);
            assertParse(result, [
                { context: {}, final: {}, low: 0, high: 3, path: ["test1"] }
            ]);
        });
        it("should parse an executable, valid, command as such prefixed by whitespace", () => {
            const result = parseCommand("   hel", singleArgData, undefined);
            assertParse(result, [
                { context: {}, final: {}, low: 3, high: 6, path: ["test1"] }
            ]);
        });

        it("should return a warning from a command which cannot be executed", () => {
            const result = parseCommand("hello", singleArgData, undefined);
            assertParse(result, [
                { low: 0, high: 5, path: ["test2"], context: {}, final: {} }
            ]);
        });

        it("should add an error if there text at the start not matched by a node", () => {
            const result = parseCommand("hi", singleArgData, undefined);
            assertParse(result, []);
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
                                type: "argument"
                            },
                            testchild2: {
                                parser: "langserver:dummy1",
                                properties: { number: 5 },
                                type: "argument"
                            }
                        },
                        executable: true,
                        parser: "langserver:dummy1",
                        type: "argument"
                    },
                    test2: {
                        parser: "langserver:dummy1",
                        properties: { number: 5 },
                        type: "argument"
                    }
                },
                type: "root"
            }
        } as any;

        it("should only add a space between nodes", () => {
            const result = parseCommand("hel hel", multiArgData, undefined);
            assertParse(result, [
                {
                    context: {},
                    final: undefined, // Limitation of assert api
                    high: 3,
                    low: 0,
                    path: ["test1"]
                },
                {
                    context: {},
                    final: {},
                    high: 7,
                    low: 4,
                    path: ["test1", "testchild1"]
                }
            ]);
        });

        it("should not add a node when a node which follows fails", () => {
            const result = parseCommand("hel hel1", multiArgData, undefined);
            assertParse(result, [
                {
                    context: {},
                    final: {},
                    high: 3,
                    low: 0,
                    path: ["test1"]
                }
            ]);
        });
    });
});
