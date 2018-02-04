import * as assert from "assert";
import { calculateDataFolder, singleStringLineToCommandLines, stringsToCommandLine } from "../function_utils";
import { } from "./logging_setup";

describe("Function Utils", () => {
    describe("calculateDataFolder()", () => {
        it("should find the datapacks folder when using a forward slash separator", () => {
            assert.deepStrictEqual(calculateDataFolder("/home/user/minecraft/datapacks/path/file.txt",
                "/home/user", "/"),
                { folder: "/home/user/minecraft/datapacks/", fallback: false });
        });
        it("should find the datapacks folder when using a backwards slash separator", () => {
            assert.deepStrictEqual(calculateDataFolder(
                "C:\\Users\\user\\Documents\\minecraft\\datapacks\\path\\file.txt",
                "C:\\Users\\user", "\\"),
                { folder: "C:\\Users\\user\\Documents\\minecraft\\datapacks\\", fallback: false });
        });
        it("should fallback to the default when there is no datapacks folder", () => {
            assert.deepStrictEqual(calculateDataFolder("/home/user/notapack/file.txt",
                "/home/user/notapack/", "/"), { folder: "/home/user/notapack/", fallback: true });
        });

        it("Ignore matches of datapacks without a folder named exactly datapacks", () => {
            assert.deepStrictEqual(calculateDataFolder("/home/user/notapack/datapackss/path/to/file.txt",
                "/home/user/notapack/", "/"), { folder: "/home/user/notapack/", fallback: true });
        });
    });
    describe("Strings To Command Line", () => {
        it("should convert an array of strings into an array of Command Lines", () => {
            assert.deepStrictEqual(stringsToCommandLine(["hello", "execute run say hi"]),
                [{ text: "hello" }, { text: "execute run say hi" }],
            );
        });
    });
    describe("Single String To Command Line", () => {
        it("should convert a multiple line string", () => {
            assert.deepStrictEqual(singleStringLineToCommandLines(`hello
execute run say hi`), [{ text: "hello" }, { text: "execute run say hi" }]);
        });
    });
});
