import * as assert from "assert";
import { CompoundNode } from "mc-nbt-paths";
import { isSuccessful } from "../../../../misc-functions";
import { NBTTagCompound } from "../../../../parsers/minecraft/nbt/tag/compound-tag";
import { NBTTagString } from "../../../../parsers/minecraft/nbt/tag/string-tag";
import { NBTWalker } from "../../../../parsers/minecraft/nbt/walker";
import { testDocs } from "./test-data";

const test = (walker: NBTValidator, name: string, extpath: string[] = []) => {
    const node = walker.walkThenValidate([name, ...extpath]);
    if (!isSuccessful(node)) {
        assert.fail("node is undefined");
        return;
    }
    assert.strictEqual(node.data.description, `${name} OK`);
};

describe("Documentation Walker Tests", () => {
    describe("getFinalNode()", () => {
        const nbt = new NBTTagCompound({
            var1: new NBTTagString("func_test")
        });
        const walker = new NBTWalker(nbt, testDocs, true, false);

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
            const node = walker.walkThenValidate(["child_ref_test"]);
            assert.deepStrictEqual(node.data, {
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
