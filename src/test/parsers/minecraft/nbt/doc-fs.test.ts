import * as assert from "assert";
import { walkDir } from "../../../../misc-functions";
import { MemoryFS } from "../../../../parsers/minecraft/nbt/doc-fs";

describe("MemoryFS tests", () => {
    describe("load()", () => {
        it("should get the correct data from the file", async () => {
            const memfs = new MemoryFS("test_data/fs_test");
            const paths = await walkDir("test_data/fs_test");
            for (const p of paths) {
                await memfs.load(p);
            }
            assert.deepStrictEqual(memfs.get("fs_test.json"), {
                description: "DocFS OK"
            });
            assert.deepStrictEqual(
                memfs.get("fs_nest_test/fs_nest_test.json"),
                {
                    description: "DocFS nesting OK"
                }
            );
        });
    });
    describe("get() & set()", () => {
        it("should get the data after setting it", () => {
            const memfs = new MemoryFS("/root");
            memfs.set("foo", true);
            assert.strictEqual(memfs.get("foo"), true);
        });
    });
    describe("setExternal()", () => {
        it("should set the correct path", () => {
            const memfs = new MemoryFS("/root");
            memfs.setExternal("/root/foo", true);
            assert.strictEqual(memfs.get("foo"), true);
        });
    });
});
