import * as assert from "assert";
import { calculateDataFolder } from "../../misc_functions/datapack_folder";

describe("Calculate Data Folder (Misc)", () => {
    it("should find the datapacks folder of the file", () => {
        assert.strictEqual(
            calculateDataFolder("/home/datapacks/pack/", "/"),
            "/home/datapacks/"
        );
    });
    it("should return nothing when there is no datapacks folder", () => {
        assert.strictEqual(
            calculateDataFolder("/home/nothing/pack/", "/"),
            undefined
        );
    });
    it("should not allow a datapacks file", () => {
        mcLangLog("Test logging");
        assert.strictEqual(
            calculateDataFolder("/home/datapacks", "/"),
            undefined
        );
        assert.strictEqual(
            calculateDataFolder("/etc/datapacks/pack/data/datapacks", "/"),
            "/etc/datapacks/"
        );
    });
    it("should allow a windows style path", () => {
        assert.strictEqual(
            calculateDataFolder("C:\\\\whatever\\datapacks\\pack\\data", "\\"),
            "C:\\\\whatever\\datapacks\\"
        );
    });
});
