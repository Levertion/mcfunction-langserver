import * as assert from "assert";
import { getDatapackResources, Resources } from "../../data/datapack_resources";

describe("Datapack Resource Testing", () => {
    it("should return the correct data", () => {
        const expected: Resources = {
            data: {
                minecraft: {
                    advancements: [],
                    functions: [],
                    loot_tables: [],
                    recipes: [],
                    structures: [],
                    tags: {
                        blocks: [],
                        functions: [
                            {
                                real_uri: "ExampleDatapack/data/minecraft/tags/functions/tick.json",
                                resource_path: "minecraft:tick",
                            },
                        ],
                        items: [],
                    },
                },
                mryurihi: {
                    advancements: [],
                    functions: [
                        {
                            real_uri: "ExampleDatapack/data/mryurihi/functions/function.mcfunction",
                            resource_path: "mryurihi:function",
                        },
                        {
                            real_uri: "ExampleDatapack2/data/mryurihi/functions/function.mcfunction",
                            resource_path: "mryurihi:function",
                        },
                    ],
                    loot_tables: [],
                    recipes: [],
                    structures: [],
                    tags: {
                        blocks: [],
                        functions: [],
                        items: [],
                    },
                },
            },
            datapacks: [
                {
                    name: "ExampleDatapack",
                    namespaces: ["minecraft", "mryurihi"],
                },
                {
                    name: "ExampleDatapack2",
                    namespaces: ["mryurihi"],
                },
            ],
        };
        assert.deepEqual(getDatapackResources("src/test/data/resources/test_world/datapacks"), expected);
    });
});
