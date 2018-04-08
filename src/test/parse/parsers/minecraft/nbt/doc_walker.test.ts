import assert = require("assert");
import path = require("path");
import { NBTWalker, NoPropertyNode } from "../../../../../parse/parsers/minecraft/nbt/doc_walker";
import { NBTTagCompound } from "../../../../../parse/parsers/minecraft/nbt/tag/compound_tag";

describe("Documentation Walker Tests", () => {
    describe("getFinalNode()", () => {
        const nbt = new NBTTagCompound({});

        it("should return the correct node for the NBT", () => {
            const walker = new NBTWalker(nbt, path.resolve(__dirname,
                "../../../../../../test_data/test_docs/test1.json"));
            const node = walker.getFinalNode(["key1", "key2"]);
            if (!node) {
                assert.fail("node is undefined");
                return;
            }
            assert.ok("type" in node);
            assert.ok((node as NoPropertyNode).type === "string", "node type was " + (node as NoPropertyNode).type);
        });
    });
});
