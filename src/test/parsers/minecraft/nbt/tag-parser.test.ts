import { NBTNode } from "mc-nbt-paths";
import { StringReader } from "../../../../brigadier/string-reader";
import { NBTTag, TagType } from "../../../../parsers/minecraft/nbt/tag/nbt-tag";
import { NBTTagNumber } from "../../../../parsers/minecraft/nbt/tag/number";
import { Correctness } from "../../../../parsers/minecraft/nbt/util/nbt-util";
import { NBTWalker } from "../../../../parsers/minecraft/nbt/walker";
import { returnAssert, ReturnAssertionInfo } from "../../../assertions";

import * as assert from "assert";

interface ParseTest {
    expected: ReturnAssertionInfo;
    text: string;
}

interface ValidateTest {
    expected: ReturnAssertionInfo;
    node: NBTNode;
    walker?: NBTWalker;
}

interface ValueTest {
    type?: TagType;
    value: any;
}

const testTag = (
    tag: NBTTag,
    parse: ParseTest,
    validate?: ValidateTest,
    value?: ValueTest
) => {
    const response = tag.parse(new StringReader(parse.text));
    returnAssert(response, parse.expected);
    if (
        response.data === Correctness.MAYBE ||
        response.data === Correctness.CERTAIN
    ) {
        if (validate) {
            const valres = tag.validate(
                { path: "", node: validate.node },
                validate.walker || new NBTWalker(new Map())
            );
            returnAssert(valres, validate.expected);
        }
        if (value) {
            assert.deepStrictEqual(tag.getValue(), value.value);
            assert.strictEqual(
                // @ts-ignore
                tag.tagType,
                value.type
            );
        }
    }
};

describe("SNBT Tag Parser Tests", () => {
    describe("Byte Tag", () => {
        it("should parse correctly", () =>
            testTag(
                new NBTTagNumber([]),
                {
                    expected: {
                        succeeds: true
                    },
                    text: "123b"
                },
                {
                    expected: {
                        succeeds: true
                    },
                    node: {
                        type: "byte"
                    }
                },
                {
                    value: 123
                }
            ));
        it("should parse as a short and fail validation", () =>
            testTag(
                new NBTTagNumber([]),
                {
                    expected: {
                        succeeds: true
                    },
                    text: "321s"
                },
                {
                    expected: {
                        succeeds: true
                    },
                    node: {
                        type: "short"
                    }
                }
            ));
        it("should give an invalid number error", () =>
            testTag(new NBTTagNumber([]), {
                expected: {
                    errors: [
                        {
                            code: "parsing.float.expected",
                            range: {
                                end: 5,
                                start: 0
                            }
                        }
                    ],
                    succeeds: false
                },
                text: "hello"
            }));
    });
});
