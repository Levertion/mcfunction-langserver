import * as assert from "assert";
import { MemoryFS } from "../../../../parsers/minecraft/nbt/doc-fs";

describe("MemoryFS tests", () => {
    describe("load()", () => {
        it("should get the correct data from the file", async () => {
            const memfs = new MemoryFS("test_data");
            await memfs.load("test_data/fs_test.json");
            assert.deepStrictEqual(memfs.get("fs_test.json"), {
                description: "DocFS OK"
            });
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
