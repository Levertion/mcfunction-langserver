import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as cache from "../../data/cache_management";
import { GlobalData } from "../../data/types";
import { } from "../logging_setup";
const cacheFolder = path.join(__dirname, "..", "..", "data", "cache");
const testData: GlobalData = {
    blocks: {
        "minecraft:chocolate": {},
    },
    commands: {
        children: {
            hello: {
                type: "literal",
            },
        },
        type: "root",
    },
    items: ["minecraft:not_chocolate"],
    meta_info: { version: "1.13" },
    resources: {},
};
describe("Cache Management", () => {
    describe("cacheData", () => {
        it("should cache the data in the folder", async () => {
            await cache.cacheData(testData);
            const files = await promisify(fs.readdir)
                (cacheFolder);
            assert.deepEqual(files.sort(),
                ["commands.json", "blocks.json", "items.json", "meta_info.json", "resources.json"].sort());
        });
    });
    describe("readCache", () => {
        it("should be consistent with cacheData", async () => {
            await cache.cacheData(testData);
            const data = await cache.readCache();
            assert.deepEqual(data, testData);
        });
    });
});
