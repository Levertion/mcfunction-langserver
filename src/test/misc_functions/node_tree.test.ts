import * as assert from "assert";
import { CommandNode, CommandTree } from "../../data/types";
import { followPath, getNextNode } from "../../misc_functions/node_tree";

const tree: CommandTree = {
    children: {
        redirect: { type: "literal", redirect: ["segment1", "segment2"] },
        segment1: { type: "literal", children: { segment2: { type: "literal" } } },
        simple: { type: "literal" },
    },
    type: "root",
};

describe("Node Tree Manipulation (Misc)", () => {
    describe("followPath()", () => {
        it("should follow the simple segments", () => {
            const result = followPath(tree, ["simple"]);
            assert.deepEqual(result,
                // @ts-ignore
                tree.children.simple);
        });
        it("should follow a multi segment path", () => {
            const result = followPath(tree, ["segment1", "segment2"]);
            assert.deepEqual(result,
                // @ts-ignore
                tree.children.segment1.children.segment2);
        });
    });
    describe("getNextNode()", () => {
        it("should give the direct node if there is no redirect", () => {
            const node: CommandNode = { type: "literal" };
            assert.deepEqual(getNextNode(node, ["simple"], tree), { node, path: ["simple"] });
        });
        it("should follow the redirect if there is a redirect", () => {
            const node: CommandNode = { type: "literal" };
            const path = ["redirect"];
            assert.deepEqual(getNextNode(followPath(tree, path), path, tree), { node, path: ["segment1", "segment2"] });
        });
    });
});
