import * as assert from "assert";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTTagByteArray } from "../../../../../parse/parsers/minecraft/nbt/tag/byte_array_tag";
import { NBTTagByte } from "../../../../../parse/parsers/minecraft/nbt/tag/byte_tag";
import { NBTTagCompound } from "../../../../../parse/parsers/minecraft/nbt/tag/compound_tag";
import { NBTTagDouble } from "../../../../../parse/parsers/minecraft/nbt/tag/double_tag";
import { NBTTagFloat } from "../../../../../parse/parsers/minecraft/nbt/tag/float_tag";
import { NBTTagInt } from "../../../../../parse/parsers/minecraft/nbt/tag/int_tag";
import { NBTTagList } from "../../../../../parse/parsers/minecraft/nbt/tag/list_tag";
import { NBTTagLong } from "../../../../../parse/parsers/minecraft/nbt/tag/long_tag";
import { NBTTag } from "../../../../../parse/parsers/minecraft/nbt/tag/nbt_tag";
import { NBTTagShort } from "../../../../../parse/parsers/minecraft/nbt/tag/short_tag";
import { NBTTagString } from "../../../../../parse/parsers/minecraft/nbt/tag/string_tag";
import { parseTag } from "../../../../../parse/parsers/minecraft/nbt/tag_parser";

describe("Tag parser tests", () => {
    describe("parseTag", () => {
        describe("byte", () => {
            [
                ["1b", 1],
                ["2e2b", 200],
                ["345b", 345],
                ["3.2e1b", 32],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a byte tag with the value of " + v[1].toString(), () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader);
                    assert.strictEqual(out.tagType, "byte");
                    assert.ok(out.tagEq(new NBTTagByte(v[1] as number)));
                }),
            );
        });
        describe("short", () => {
            [
                ["52s", 52],
                ["0.1e2s", 10],
                ["2765s", 2765],
                ["5e0s", 5],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a short tag with the value of " + v[1].toString(), () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader);
                    assert.strictEqual(out.tagType, "short");
                    assert.ok(out.tagEq(new NBTTagShort(v[1] as number)));
                }),
            );
        });
        describe("int", () => {
            [
                ["17", 17],
                ["1e5", 100000],
                ["3146", 3146],
                ["5.45e3", 5450],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a int tag with the value of " + v[1].toString(), () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader);
                    assert.strictEqual(out.tagType, "int");
                    assert.ok(out.tagEq(new NBTTagInt(v[1] as number)));
                }),
            );
        });
        describe("long", () => {
            [
                ["538578l", 538578],
                ["0.145e9l", 145000000],
                ["2712455l", 2712455],
                ["1234e6l", 1234000000],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a long tag with the value of " + v[1].toString(), () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader);
                    assert.strictEqual(out.tagType, "long");
                    assert.ok(out.tagEq(new NBTTagLong(v[1] as number)));
                }),
            );
        });
        describe("float", () => {
            [
                ["0.254f", 0.254],
                ["0.145e-2f", 0.00145],
                ["83f", 83],
                ["0.45e2f", 45],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a float tag with the value of " + v[1].toString(), () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader);
                    assert.strictEqual(out.tagType, "float");
                    assert.ok(out.tagEq(new NBTTagFloat(v[1] as number)));
                }),
            );
        });
        describe("double", () => {
            [
                ["0.25412d", 0.25412],
                ["0.31e-3d", 0.00031],
                ["5832d", 5832],
                ["1.2e2d", 120],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a double tag with the value of " + v[1].toString(), () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader);
                    assert.strictEqual(out.tagType, "double");
                    assert.ok(out.tagEq(new NBTTagDouble(v[1] as number)));
                }),
            );
        });
        describe("byte array", () => {
            [
                ["[B;0b,1b,2b,3b]", [0, 1, 2, 3]],
                ["[B;112b,3b,7b,8b,234b,5b,32b,5b]", [112, 3, 7, 8, 234, 5, 32, 5]],
            ].forEach((v) =>
                it(v[0].toString() +
                    " should return as a byte array tag with a value of [" +
                    v[1].toString() +
                    "]", () => {
                        const reader = new StringReader(v[0].toString());
                        const out = parseTag(reader);
                        assert.strictEqual(out.tagType, "byte_array");
                        assert.ok(out.tagEq(new NBTTagByteArray((v[1] as number[]).map(
                            (v1) => new NBTTagByte(v1),
                        ))));
                    }),
            );
        });
        describe("string", () => {
            [
                ["hi", "hi"],
                ["\"1 hello\"", "1 hello"],
            ].forEach((v) =>
                it(v[0].toString() +
                    " should return as a string tag with a value of '" +
                    v[1].toString() +
                    "'", () => {
                        const reader = new StringReader(v[0].toString());
                        const out = parseTag(reader);
                        assert.strictEqual(out.tagType, "string");
                        assert.ok(out.tagEq(new NBTTagString(v[1])));
                    }),
            );
        });
        describe("list", () => {
            [
                ["[hi,bye]", [new NBTTagString("hi"), new NBTTagString("bye")]],
                ["[[1],[2,3],[4]]", [
                    new NBTTagList([new NBTTagInt(1)]),
                    new NBTTagList([new NBTTagInt(2), new NBTTagInt(3)]),
                    new NBTTagList([new NBTTagInt(4)]),
                ]],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a list tag with the correct value", () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader) as NBTTagList;
                    assert.strictEqual(out.tagType, "list");
                    assert.ok(out.tagEq(new NBTTagList(v[1] as Array<NBTTag<any>>)));
                }),
            );
        });
        describe("compound", () => {
            [
                ["{foo :bar }", { foo: new NBTTagString("bar") }],
                ["{foo:{bar:baz}}", { foo: new NBTTagCompound({ bar: new NBTTagString("baz") }) }],
            ].forEach((v) =>
                it(v[0].toString() + " should return as a compound tag with the correct value", () => {
                    const reader = new StringReader(v[0].toString());
                    const out = parseTag(reader) as NBTTagList;
                    assert.strictEqual(out.tagType, "compound");
                    assert.ok(out.tagEq(new NBTTagCompound(v[1] as { [key: string]: NBTTag<any> })));
                }),
            );
        });
    });
});
