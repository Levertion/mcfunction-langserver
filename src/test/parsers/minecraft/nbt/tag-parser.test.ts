import { NBTNode } from "mc-nbt-paths";

import { StringReader } from "../../../../brigadier/string-reader";
import { NBTDocs } from "../../../../data/types";
import {
    NBTTag,
    ParseReturn
} from "../../../../parsers/minecraft/nbt/tag/nbt-tag";
import { NBTTagNumber } from "../../../../parsers/minecraft/nbt/tag/number";
import { NBTWalker } from "../../../../parsers/minecraft/nbt/walker";
import { ReturnSuccess } from "../../../../types";
import { snapshot } from "../../../assertions";

function testTag(
    tagConstructor: new (path: string[]) => NBTTag,
    node: NBTNode | string[] = [],
    docs?: NBTDocs
): (value: string) => [ParseReturn, ReturnSuccess<undefined>] | ParseReturn {
    function testTagInner(
        value: string
    ): [ParseReturn, ReturnSuccess<undefined>] | ParseReturn {
        const tag = new tagConstructor([]);
        const reader = new StringReader(value);
        const parseReturn = tag.parse(reader);
        if (docs) {
            const walker = new NBTWalker(docs);
            const realNode = Array.isArray(node)
                ? walker.getInitialNode(node)
                : { path: "", node };
            return [parseReturn, tag.validate(realNode, walker)];
        }
        return parseReturn;
    }
    return testTagInner;
}

describe("SNBT Tag Parsers", () => {
    describe("Byte Tag", () => {
        it("should parse correctly", () =>
            snapshot(
                testTag(NBTTagNumber, {
                    type: "byte"
                }),
                "123b",
                "321s",
                "hello",
                "true",
                "false",
                "130b",
                "-10b",
                "-130b"
            ));
    });
});
