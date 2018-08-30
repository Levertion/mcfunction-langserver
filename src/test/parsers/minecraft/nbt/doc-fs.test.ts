import * as assert from "assert";
import { MemoryFS } from "../../../../parsers/minecraft/nbt/doc-fs";

describe("MemoryFS tests", () => {
    describe("load()", () => {
        it("should get the correct data from the file", async () => {
            const memfs = new MemoryFS("test_data/test_docs");
            await memfs.load("test_data/test_docs/root.json");
            assert.deepStrictEqual(memfs.get("root.json"), {
                children: {
                    alt_frag_test: {
                        children: {
                            key0: {
                                ref: "./alt_frag_test.json#key0"
                            }
                        },
                        type: "compound"
                    },
                    basic_test: {
                        description: "basic_test OK"
                    },
                    child_ref_test: {
                        child_ref: ["./child_ref_test.json"],
                        children: {
                            key1: {
                                description: "child_ref_self_test OK"
                            }
                        },
                        type: "compound"
                    },
                    func_test: {
                        function: {
                            id: "insertStringNBT",
                            params: {
                                default: "./func_test_fail.json",
                                ref: "./%s.json",
                                tag_path: "./var1"
                            }
                        }
                    },
                    list_test: {
                        item: {
                            description: "list_test OK"
                        },
                        type: "list"
                    },
                    nest_test: {
                        children: {
                            key0: {
                                description: "nest_test OK"
                            }
                        },
                        type: "compound"
                    },
                    ref_test: {
                        ref: "./ref_test.json"
                    },
                    self_frag_ok: {
                        description: "self_frag_test OK"
                    },
                    self_frag_test: {
                        ref: "./root.json#self_frag_ok"
                    }
                },
                type: "compound"
            });
        });
    });
    describe("get() & set()", () => {
        it("should get the data after setting it", () => {
            const memfs = new MemoryFS("/root");
            memfs.set("foo", true);
            assert.strictEqual(memfs.get("foo"), true);
        });
    });
    describe("setExternal()", () => {
        it("should set the correct path", () => {
            const memfs = new MemoryFS("/root");
            memfs.setExternal("/root/foo", true);
            assert.strictEqual(memfs.get("foo"), true);
        });
    });
});
