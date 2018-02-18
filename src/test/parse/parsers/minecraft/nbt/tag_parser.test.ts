import * as assert from "assert";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTTagByte } from "../../../../../parse/parsers/minecraft/nbt/tag/byte_tag";
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
                ["27s", 27],
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
    });
});
