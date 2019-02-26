import * as assert from "assert";
import { CompoundNode } from "mc-nbt-paths";

import { NBTTagCompound } from "../../../../parsers/minecraft/nbt/tag/compound-tag";
import { NBTTagString } from "../../../../parsers/minecraft/nbt/tag/string-tag";
import { NodeInfo } from "../../../../parsers/minecraft/nbt/util/doc-walker-util";
import { NBTWalker } from "../../../../parsers/minecraft/nbt/walker";

import { testDocs } from "./test-data";

const test = (walker: NBTWalker, name: string, extpath: string[] = []) => {
    const node = walker.getInitialNode([name, ...extpath]);
    assert.strictEqual(node.node.description, `${name} OK`);
};

describe("Documentation Walker Tests", () => {
    describe("getInitialNode()", () => {
        const walker = new NBTWalker(testDocs);

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

        it.skip("should return the correct node for funcs", () => {
            // TODO: Rework
            const map = new Map<string, NBTTagString>();
            map.set("var1", new NBTTagString(["var1"]).setValue("func_test"));
            // @ts-ignore
            // tslint:disable-next-line:variable-name
            const _nbt = new NBTTagCompound([]).setValue(map);
            test(walker, "func_test");
        });

        it("should return the correct node for ref pointing to 'references'", () => {
            test(walker, "ref_references_test");
        });

        it("should merge child_ref correctly", () => {
            const node = walker.getInitialNode(["child_ref_test"]);
            const children = walker.getChildren(node as NodeInfo<CompoundNode>);
            assert.deepStrictEqual(children, {
                bad: {
                    node: {
                        description: "child_ref_test BAD",
                        type: "no-nbt"
                    },
                    path: "root.json"
                },
                badkey: {
                    node: {
                        description: "child_ref_test BAD",
                        type: "no-nbt"
                    },
                    path: "child_ref_test.json"
                },
                key0: {
                    node: {
                        description: "child_ref_test OK",
                        type: "no-nbt"
                    },
                    path: "child_ref_test.json"
                }
            });
        });

        it("should return the correct node for root node groups", () => {
            test(walker, "root_group_test", ["key3"]);
        });
    });
});
