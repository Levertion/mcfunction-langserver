import * as assert from "assert";
import * as path from "path";
import { getDatapacks } from "../../data/datapack_resources";
import { Datapack } from "../../data/types";

// Tests are run from within the lib folder, but data is in the root
const rootFolder = path.join(__dirname, "..", "..", "..", "test_data");
describe("Datapack Resource Testing", () => {
    it("should return the correct data", async () => {
        const expected: Datapack[] = [
            {
                namespaces: {
                    minecraft: {
                        function_tags: [
                            {
                                resource_name: {
                                    namespace: "minecraft",
                                    path: "tick"
                                }
                            }
                        ]
                    },
                    test_namespace: {
                        functions: [
                            {
                                resource_name: {
                                    namespace: "test_namespace",
                                    path: "function"
                                }
                            }
                        ]
                    }
                },
                path: path.join(
                    rootFolder,
                    "test_world",
                    "datapacks",
                    "ExampleDatapack"
                )
            },
            {
                namespaces: {
                    test_namespace: {
                        functions: [
                            {
                                resource_name: {
                                    namespace: "test_namespace",
                                    path: "function"
                                }
                            }
                        ]
                    }
                },
                path: path.join(
                    rootFolder,
                    "test_world",
                    "datapacks",
                    "ExampleDatapack2"
                )
            }
        ];
        const result = await getDatapacks(
            path.join(rootFolder, "test_world", "datapacks")
        );
        result.sort((a, b) => a.path.length - b.path.length);
        assert.deepStrictEqual(result, expected);
    });
});
