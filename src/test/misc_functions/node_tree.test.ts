import * as assert from "assert";
import { CommandNode, CommandTree } from "../../data/types";
import { followPath, getNextNode } from "../../misc_functions/node_tree";

const tree: CommandTree = {
  children: {
    redirect: { type: "literal", redirect: ["segment1", "segment2"] },
    run: { type: "literal" },
    segment1: {
      children: { segment2: { type: "literal", executable: true } },
      type: "literal"
    },
    simple: { type: "literal", executable: true }
  },
  type: "root"
};

describe("Node Tree Manipulation (Misc)", () => {
  describe("followPath()", () => {
    it("should follow the simple segments", () => {
      const result = followPath(tree, ["simple"]);
      assert.deepStrictEqual(
        result,
        // @ts-ignore
        tree.children.simple
      );
    });
    it("should follow a multi segment path", () => {
      const result = followPath(tree, ["segment1", "segment2"]);
      assert.deepStrictEqual(
        result,
        // @ts-ignore
        tree.children.segment1.children.segment2
      );
    });
  });
  describe("getNextNode()", () => {
    it("should give the direct node if there is no redirect", () => {
      const node: CommandNode = { type: "literal", executable: true };
      assert.deepStrictEqual(getNextNode(node, ["simple"], tree), {
        node,
        path: ["simple"]
      });
    });
    it("should follow the redirect if there is a redirect", () => {
      const node: CommandNode = { type: "literal", executable: true };
      const path = ["redirect"];
      assert.deepStrictEqual(getNextNode(followPath(tree, path), path, tree), {
        node,
        path: ["segment1", "segment2"]
      });
    });
    it("should redirect to the root if there is a non-executable node with no children and no redirect", () => {
      const path = ["run"];
      assert.deepStrictEqual(getNextNode(followPath(tree, path), path, tree), {
        node: tree,
        path: []
      });
    });
  });
});
