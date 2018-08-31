import * as assert from "assert";
import * as path from "path";
import { setupFiles } from "../../../../data/noncached";
import { NBTWalker } from "../../../../parsers/minecraft/nbt/doc-walker";
import { NBTTagCompound } from "../../../../parsers/minecraft/nbt/tag/compound-tag";
import { NBTTagString } from "../../../../parsers/minecraft/nbt/tag/string-tag";

describe("Documentation Walker Tests", () => {
    describe("getFinalNode()", async () => {
        const nbt = new NBTTagCompound({ var1: new NBTTagString("func_test") });
        const dataPath = path.resolve(
            __dirname,
            "../../../../../test_data/test_docs"
        );

        const v = await setupFiles(path.dirname(dataPath));

        const walker = new NBTWalker(nbt, v, "root.json");
        it("should return the correct node for the basic doc", () => {
            const node = walker.getFinalNode(["basic_test"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node.description, "basic_test OK");
        });

        it("should return the correct node for nested nodes", () => {
            const node = walker.getFinalNode(["nest_test", "key0"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node.description, "nest_test OK");
        });

        it("should return the correct node for the ref property", () => {
            const node = walker.getFinalNode(["ref_test"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node.description, "ref_test OK");
        });

        it("should return the correct node for the child_ref property", () => {
            const node = walker.getFinalNode(["child_ref_test", "key0"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node.description, "child_ref_test OK");
        });

        it("should return the correct node for the child_ref property but self", () => {
            const node = walker.getFinalNode(["child_ref_test", "key1"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node.description, "child_ref_self_test OK");
        });

        it("should return the correct node for lists", () => {
            const node = walker.getFinalNode(["list_test", "0"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node, "list_test OK");
        });

        it("should return the correct node for funcs", () => {
            const node = walker.getFinalNode(["func_test"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.strictEqual(node.description, "func_test OK");
        });
    });
});
