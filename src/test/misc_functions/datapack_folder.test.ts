import * as assert from "assert";
import { calculateDataFolder } from "../../misc_functions/datapack_folder";

describe("Calculate Data Folder (Misc)", () => {
  it("should find the datapacks folder of the file", () => {
    assert.equal(
      calculateDataFolder("/home/datapacks/pack/", "/"),
      "/home/datapacks/"
    );
  });
  it("should return nothing when there is no datapacks folder", () => {
    assert.equal(calculateDataFolder("/home/nothing/pack/", "/"), undefined);
  });
  it("should not allow a datapacks file", () => {
    mcLangLog("Test logging");
    assert.equal(calculateDataFolder("/home/datapacks", "/"), undefined);
    assert.equal(
      calculateDataFolder("/etc/datapacks/pack/data/datapacks", "/"),
      "/etc/datapacks/"
    );
  });
  it("should allow a windows style path", () => {
    assert.equal(
      calculateDataFolder("C:\\\\whatever\\datapacks\\pack\\data", "\\"),
      "C:\\\\whatever\\datapacks\\"
    );
  });
});
