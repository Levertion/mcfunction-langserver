import assert = require("assert");
import { CommandError } from "../../../brigadier_components/errors";
import { StringReader } from "../../../brigadier_components/string_reader";
import { SwizzleParser } from "../../../parsers/minecraft/swizzle";
import { Suggestion } from "../../../types";

const parser = new SwizzleParser();

describe("Swizzle", () => {
    describe("parse()", () => {
        [
            "z",
            "yx",
            "xyz",
        ].forEach((v) => it("should not throw when parsing " + v, () => {
            const reader = new StringReader(v);
            assert.doesNotThrow(() => parser.parse(reader));
        }));
        [
            ["xx", "x"],
            ["zyy", "y"],
            ["xyyz", "y"],
        ].forEach((v) => it("should throw a duplicate exception when parsing " + v[0], () => {
            const reader = new StringReader(v[0]);
            try {
                parser.parse(reader);
                assert.fail("Did not throw an error");
            } catch (e) {
                const ex = e as CommandError;
                assert.strictEqual(ex.code, "argument.swizzle.duplicate");
                assert.strictEqual(ex.text, `Duplicate character '${v[1]}'`);
            }
        }));
        [
            ["ax", "a"],
            ["xyb", "b"],
            ["xxf", "f"], // Invalid character checking should come before duplicate checking
        ].forEach((v) => it("should throw an invalid character exception when parsing " + v[0], () => {
            const reader = new StringReader(v[0]);
            try {
                parser.parse(reader);
                assert.fail("Did not throw an error");
            } catch (e) {
                const ex = e as CommandError;
                assert.strictEqual(ex.code, "argument.swizzle.invalid");
                assert.strictEqual(ex.text, `Invalid character '${v[1]}'`);
            }
        }));
    });
    describe("getSuggestions()", () => {
        [
            ["", ["x", "y", "z", "xy", "xz", "yz", "xyz"]],
            ["z", ["z", "zx", "zy", "zxy"]],
            ["yx", ["yx", "yxz"]],
            ["xyz", ["xyz"]],
        ].forEach((v) => it("should return correct suggestion for " + v[0], () => {
            const arg = parser.parse(new StringReader(v[0] as string));
            const out = arg.suggestions as Suggestion[];
            assert.ok(
                out.map((v2) => v2).every(
                    (v2) => (v[1] as string[]).indexOf(v2.text) !== -1,
                ),
                `[${out.map((v2) => v2.text).join(", ")}] does not match [${(v[1] as string[]).join(", ")}]`,
            );
        }));
    });
});
