import * as assert from "assert";
import { groupResources } from "../../data/resource_grouping";
import { GlobalData } from "../../data/types";
import { CommmandData } from "../../types";

const dummyData: CommmandData = {
    globalData: {
        resources: {
            advancements: [
                {
                    uri: "advancements/test.json",
                    resource_name: { namespace: "minecraft", path: "test" },
                },
            ],
        },
    } as GlobalData,
    localData: {
        data: {
            test: {
                advancements: [{
                    uri: "advancements/test1.json",
                    resource_name: { namespace: "test", path: "test1" },
                }],
                recipes: [{
                    uri: "recipes/recipe.json",
                    resource_name: { namespace: "test", path: "recipe" },
                }],
            },
        },
        datapacks: [{ name: "test1", namespaces: ["test"], packs_folder: "" }],
    },
};

describe("groupResources", () => {
    it("should only collect the specified type of resource", () => {
        const result = groupResources(dummyData, "advancements");
        result.sort((a, b) => a.real_uri.length - b.real_uri.length);
        assert.deepEqual(result, [{
            real_uri: "advancements/test.json", resource_name: { namespace: "minecraft", path: "test" },
        },
        {
            real_uri: "advancements/test1.json", resource_name: { namespace: "test", path: "test1" },
        }]);
    });
});
