import * as assert from "assert";
import { calculateDataFolder, singleStringLineToCommandLines, stringsToCommandLine } from "../function_utils";
import { } from "./logging_setup";

describe("Function Utils", () => {
    describe("calculateDataFolder()", () => {
        it("should find the datapacks folder when using a forward slash separator", () => {
            assert.equal(calculateDataFolder("/home/user/minecraft/datapacks/path/file.txt",
                "/home/user", "/"),
                "/home/user/minecraft/datapacks/");
        });
        it("should find the datapacks folder when using a backwards slash separator", () => {
            assert.equal(calculateDataFolder("C:\\Users\\user\\Documents\\minecraft\\datapacks\\path\\file.txt",
                "C:\\Users\\user", "\\"),
                "C:\\Users\\user\\Documents\\minecraft\\datapacks\\");
        });
        it("should fallback to the default when there is no datapacks folder", () => {
            assert.equal(calculateDataFolder("/home/user/notapack/file.txt",
                "/home/user/notapack/", "/"), "/home/user/notapack/");
        });

        it("Ignore matches of datapacks without a folder named exactly datapacks", () => {
            assert.equal(calculateDataFolder("/home/user/notapack/datapackss/path/to/file.txt",
                "/home/user/notapack/", "/"), "/home/user/notapack/");
        });
    });
    describe("Strings To Command Line", () => {
        it("should convert an array of strings into an array of Command Lines", () => {
            assert.deepEqual(stringsToCommandLine(["hello", "execute run say hi"]),
                [{ text: "hello" }, { text: "execute run say hi" }],
            );
        });
    });
    describe("Single String To Command Line", () => {
        it("should convert a multiple line string", () => {
            assert.deepEqual(singleStringLineToCommandLines(`hello
execute run say hi`), [{ text: "hello" }, { text: "execute run say hi" }]);
        });
    });
});
