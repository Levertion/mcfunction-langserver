import * as assert from "assert";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTTagByte } from "../../../../../parse/parsers/minecraft/nbt/tag/byte_tag";
import { NBTTagDouble } from "../../../../../parse/parsers/minecraft/nbt/tag/double_tag";
import { NBTTagFloat } from "../../../../../parse/parsers/minecraft/nbt/tag/float_tag";
import { NBTTagInt } from "../../../../../parse/parsers/minecraft/nbt/tag/int_tag";
import { NBTTagLong } from "../../../../../parse/parsers/minecraft/nbt/tag/long_tag";
import { NBTTagShort } from "../../../../../parse/parsers/minecraft/nbt/tag/short_tag";
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
                    assert.strictEqual(
                        (out as NBTTagByte).getVal(),
                        new NBTTagByte(v[1] as number).getVal(),
                    );
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
                    assert.strictEqual(
                        (out as NBTTagShort).getVal(),
                        new NBTTagShort(v[1] as number).getVal(),
                    );
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
                    assert.strictEqual(
                        (out as NBTTagInt).getVal(),
                        new NBTTagInt(v[1] as number).getVal(),
                    );
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
                    assert.strictEqual(
                        (out as NBTTagLong).getVal(),
                        new NBTTagLong(v[1] as number).getVal(),
                    );
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
                    assert.strictEqual(
                        (out as NBTTagFloat).getVal(),
                        new NBTTagFloat(v[1] as number).getVal(),
                    );
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
                    assert.strictEqual(
                        (out as NBTTagDouble).getVal(),
                        new NBTTagDouble(v[1] as number).getVal(),
                    );
                }),
            );
        });
    });
});
