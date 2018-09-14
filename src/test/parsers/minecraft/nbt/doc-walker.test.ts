import * as assert from "assert";
import * as path from "path";
import { setupFiles } from "../../../../data/noncached";
import { MemoryFS } from "../../../../parsers/minecraft/nbt/doc-fs";
import { NBTWalker } from "../../../../parsers/minecraft/nbt/doc-walker";
import { NBTTagCompound } from "../../../../parsers/minecraft/nbt/tag/compound-tag";
import { NBTTagString } from "../../../../parsers/minecraft/nbt/tag/string-tag";
import { CompoundNode } from "../../../../parsers/minecraft/nbt/util/doc-walker-util";

const test = (walker: NBTWalker, name: string, extpath: string[] = []) => {
    const node = walker.getFinalNode([name, ...extpath]);
    if (!node) {
        assert.fail("node is undefined");
        return;
    }
    assert.strictEqual(node.description, `${name} OK`);
};

describe("Documentation Walker Tests", () => {
    describe("getFinalNode()", () => {
        let v: MemoryFS;
        let walker: NBTWalker;

        before(async () => {
            const nbt = new NBTTagCompound({
                var1: new NBTTagString("func_test")
            });
            const dataPath = path.resolve(
                __dirname,
                "../../../../../test_data/test_docs"
            );
            v = await setupFiles(dataPath);
            walker = new NBTWalker(nbt, v, "root.json");
        });

        it("should return the correct node for the basic doc", () => {
            test(walker, "basic_test");
        });

        it("should return the correct node for nested nodes", () => {
            test(walker, "nest_test", ["key0"]);
        });

        it("should return the correct node for the ref property", () => {
            test(walker, "ref_test");
        });

        it("should return the correct node for the child_ref property", () => {
            test(walker, "child_ref_test", ["key0"]);
        });

        it("should return the correct node for the child_ref property but self", () => {
            test(walker, "child_ref_self_test", ["key1"]);
        });

        it("should return the correct node for lists", () => {
            test(walker, "list_test", ["0"]);
        });

        it("should return the correct node for funcs", () => {
            test(walker, "func_test");
        });

        it("should return the correct node for ref pointing to `references`", () => {
            test(walker, "ref_references_test");
        });

        it("should merge child_ref correctly", () => {
            const node = walker.getFinalNode(["child_ref_test"]);
            assert.deepStrictEqual(node, {
                children: {
                    bad: {
                        description: "child_ref_test BAD",
                        type: "no-nbt"
                    },
                    badkey: {
                        description: "child_ref_test BAD",
                        type: "no-nbt"
                    },
                    key0: {
                        description: "child_ref_test OK",
                        type: "no-nbt"
                    }
                },
                description: undefined,
                suggestions: undefined,
                type: "compound"
            } as CompoundNode);
        });

        it("should return the correct node for root node groups", () => {
            test(walker, "root_group_test", ["key3"]);
        });
    });
});
