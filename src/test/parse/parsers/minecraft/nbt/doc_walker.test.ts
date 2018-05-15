import assert = require("assert");
import path = require("path");
import { NBTWalker } from "../../../../../parse/parsers/minecraft/nbt/doc_walker";
import { NBTTagCompound } from "../../../../../parse/parsers/minecraft/nbt/tag/compound_tag";
import { NBTTagString } from "../../../../../parse/parsers/minecraft/nbt/tag/string_tag";

describe("Documentation Walker Tests", () => {
    describe("getFinalNode()", () => {
        const nbt = new NBTTagCompound({ var1: new NBTTagString("func_test") });
        const walker = new NBTWalker(nbt, path.resolve(__dirname,
            "../../../../../../test_data/test_docs/root.json"));

        it("should return the correct node for the basic doc", () => {
            const node = walker.getFinalNode(["basic_test"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "basic_test OK");
        });

        it("should return the correct node for nested nodes", () => {
            const node = walker.getFinalNode(["nest_test", "key0"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "nest_test OK");
        });

        it("should return the correct node for the ref property", () => {
            const node = walker.getFinalNode(["ref_test"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "ref_test OK");
        });

        it("should return the correct node for the child_ref property", () => {
            const node = walker.getFinalNode(["child_ref_test", "key0"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "child_ref_test OK");
        });

        it("should return the correct node for the child_ref property but self", () => {
            const node = walker.getFinalNode(["child_ref_test", "key1"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "child_ref_self_test OK");
        });

        it("should return the correct node for lists", () => {
            const node = walker.getFinalNode(["list_test", "0"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "list_test OK");
        });

        it("should return the correct node for funcs", () => {
            const node = walker.getFinalNode(["func_test"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("description" in node);
            assert.ok(node.description === "func_test OK");
        });
    });
});