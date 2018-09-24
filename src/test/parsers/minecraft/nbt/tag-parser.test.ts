import * as assert from "assert";
import { StringReader } from "../../../../brigadier/string-reader";
import { parseTag } from "../../../../parsers/minecraft/nbt/tag-parser";
import { NBTTagByteArray } from "../../../../parsers/minecraft/nbt/tag/byte-array-tag";
import { NBTTagByte } from "../../../../parsers/minecraft/nbt/tag/byte-tag";
import { NBTTagCompound } from "../../../../parsers/minecraft/nbt/tag/compound-tag";
import { NBTTagDouble } from "../../../../parsers/minecraft/nbt/tag/double-tag";
import { NBTTagFloat } from "../../../../parsers/minecraft/nbt/tag/float-tag";
import { NBTTagInt } from "../../../../parsers/minecraft/nbt/tag/int-tag";
import { NBTTagList } from "../../../../parsers/minecraft/nbt/tag/list-tag";
import { NBTTagLong } from "../../../../parsers/minecraft/nbt/tag/long-tag";
import { NBTTag } from "../../../../parsers/minecraft/nbt/tag/nbt-tag";
import { NBTTagShort } from "../../../../parsers/minecraft/nbt/tag/short-tag";
import { NBTTagString } from "../../../../parsers/minecraft/nbt/tag/string-tag";

describe("Tag parser tests", () => {
    describe("parseTag", () => {
        describe("byte", () => {
            [["1b", 1], ["0.5e2b", 50], ["127b", 127], ["3.2e1b", 32]].forEach(
                v =>
                    it(`${v[0].toString()} should return as a byte tag with the value of ${v[1].toString()}`, () => {
                        const reader = new StringReader(v[0].toString());
                        const out = parseTag(reader).data as NBTTagByte;
                        assert.strictEqual(out.tagType, "byte");
                        assert.ok(out.tagEq(new NBTTagByte(v[1] as number)));
                    })
            );
        });
        describe("short", () => {
            [["52s", 52], ["0.1e2s", 10], ["2765s", 2765], ["5e0s", 5]].forEach(
                v =>
                    it(`${v[0].toString()} should return as a short tag with the value of ${v[1].toString()}`, () => {
                        const reader = new StringReader(v[0].toString());
                        const out = parseTag(reader).data as NBTTagShort;
                        assert.strictEqual(out.tagType, "short");
                        assert.ok(out.tagEq(new NBTTagShort(v[1] as number)));
                    })
            );
        });
        describe("int", () => {
            [
                ["17", 17],
                ["1e5", 100000],
                ["3146", 3146],
                ["5.45e3", 5450]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a int tag with the value of ${v[1].toString()}`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagInt;
                    assert.strictEqual(out.tagType, "int");
                    assert.ok(out.tagEq(new NBTTagInt(v[1] as number)));
                })
            );
        });
        describe("long", () => {
            [
                ["538578l", 538578],
                ["0.145e9l", 145000000],
                ["2712455l", 2712455],
                ["1234e6l", 1234000000]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a long tag with the value of ${v[1].toString()}`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagLong;
                    assert.strictEqual(out.tagType, "long");
                    assert.ok(out.tagEq(new NBTTagLong(v[1] as number)));
                })
            );
        });
        describe("float", () => {
            [
                ["0.254f", 0.254],
                ["0.145e-2f", 0.00145],
                ["83f", 83],
                ["0.45e2f", 45]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a float tag with the value of ${v[1].toString()}`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagFloat;
                    assert.strictEqual(out.tagType, "float");
                    assert.ok(out.tagEq(new NBTTagFloat(v[1] as number)));
                })
            );
        });
        describe("double", () => {
            [
                ["0.25412d", 0.25412],
                ["0.31e-3d", 0.00031],
                ["5832d", 5832],
                ["1.2e2d", 120]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a double tag with the value of ${v[1].toString()}`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagDouble;
                    assert.strictEqual(out.tagType, "double");
                    assert.ok(out.tagEq(new NBTTagDouble(v[1] as number)));
                })
            );
        });
        describe("byte array", () => {
            [
                ["[B;0b,1b,2b,3b]", [0, 1, 2, 3]],
                [
                    "[B;112b,3b,7b,8b,234b,5b,32b,5b]",
                    [112, 3, 7, 8, 234, 5, 32, 5]
                ]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a byte array tag with a value of [${v[1].toString()}]`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagByteArray;
                    assert.strictEqual(out.tagType, "byte_array");
                    assert.ok(
                        out.tagEq(
                            new NBTTagByteArray(
                                (v[1] as number[]).map(v1 => new NBTTagByte(v1))
                            )
                        )
                    );
                })
            );
        });
        describe("string", () => {
            [["hi", "hi"], ['"1 hello"', "1 hello"]].forEach(v =>
                it(`${v[0].toString()} should return as a string tag with a value of '${v[1].toString()}'`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagString;
                    assert.strictEqual(out.tagType, "string");
                    assert.ok(out.tagEq(new NBTTagString(v[1])));
                })
            );
        });
        describe("list", () => {
            [
                ["[hi,bye]", [new NBTTagString("hi"), new NBTTagString("bye")]],
                [
                    "[[1],[2,3],[4]]",
                    [
                        new NBTTagList([new NBTTagInt(1)]),
                        new NBTTagList([new NBTTagInt(2), new NBTTagInt(3)]),
                        new NBTTagList([new NBTTagInt(4)])
                    ]
                ]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a list tag with the correct value`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagList;
                    assert.strictEqual(out.tagType, "list");
                    assert.ok(
                        out.tagEq(new NBTTagList(v[1] as Array<NBTTag<any>>))
                    );
                })
            );
        });
        describe("compound", () => {
            [
                ["{foo :bar }", { foo: new NBTTagString("bar") }],
                [
                    "{foo:{bar:baz}}",
                    {
                        foo: new NBTTagCompound({
                            bar: new NBTTagString("baz")
                        })
                    }
                ]
            ].forEach(v =>
                it(`${v[0].toString()} should return as a compound tag with the correct value`, () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader).data as NBTTagCompound;
                    assert.strictEqual(out.tagType, "compound");
                    assert.ok(
                        out.tagEq(
                            new NBTTagCompound(v[1] as {
                                [key: string]: NBTTag<any>;
                            })
                        )
                    );
                })
            );
        });
    });
});