import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
// tslint:disable-next-line:no-implicit-dependencies This is only for testing
import * as rimraf from "rimraf";
import { promisify } from "util";

import * as cache from "../../data/cache";
import { Cacheable } from "../../data/types";

const rimrafAsync = promisify(rimraf);

const cacheFolder = path.join(process.cwd(), "cache");
const testData: Cacheable = {
    blocks: {
        "minecraft:chocolate": {}
    },
    commands: {
        children: {
            hello: {
                type: "literal"
            }
        },
        type: "root"
    },
    meta_info: { version: "1.13" },
    registries: { "minecraft:items": new Set(["test", "test2"]) },
    resources: {}
} as any;
describe("Cache Management", () => {
    after(async () => rimrafAsync(cacheFolder));
    describe("cacheData", () => {
        it("should cache the data in the folder", async () => {
            await cache.cacheData(testData);
            const files = await promisify(fs.readdir)(cacheFolder);
            assert.deepStrictEqual(
                files.sort(),
                [
                    "commands.json",
                    "blocks.json",
                    "meta_info.json",
                    "registries.json",
                    "resources.json"
                ].sort()
            );
        });
    });
    describe("readCache", () => {
        it("should be consistent with cacheData", async () => {
            await cache.cacheData(testData);
            const data = await cache.readCache();
            assert.deepStrictEqual(data, testData);
        });
    });
});
