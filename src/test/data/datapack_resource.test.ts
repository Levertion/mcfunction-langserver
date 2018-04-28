import * as assert from "assert";
import * as path from "path";
import { getDatapacksResources, Resources } from "../../data/datapack_resources";
const logger = (message: string) => {
    // tslint:disable-next-line:no-console
    console.log(message);
};

global.mcLangLog = Object.assign(logger,
    { internal: (message: string) => logger(`[McFunctionInternal] ${message}`) });

// Tests are run from within the lib folder, but data is in the root
const rootFolder = path.join(__dirname, "..", "..", "..", "test_data");
describe("Datapack Resource Testing", () => {
    it("should return the correct data", async () => {
        const expected: Resources = {
            data: {
                minecraft: {
                    function_tags: [
                        {
                            uri: path.normalize("tags/functions/tick.json"),
                            resource_name: { namespace: "minecraft", path: "tick" },
                        },
                    ],
                },
                mryurihi: {
                    functions: [
                        {
                            uri: path.normalize("functions/function.mcfunction"),
                            resource_name: { namespace: "mryurihi", path: "function" },
                        },
                        // Included in both datapacks so repeated.
                        // Maybe worth changing?
                        {
                            uri: path.normalize("functions/function.mcfunction"),
                            resource_name: { namespace: "mryurihi", path: "function" },
                        },
                    ],
                },
            },
            datapacks: [
                {
                    name: "ExampleDatapack",
                    namespaces: ["minecraft", "mryurihi"],
                    packs_folder: path.join(rootFolder, "test_world", "datapacks"),
                },
                {
                    name: "ExampleDatapack2",
                    namespaces: ["mryurihi"],
                    packs_folder: path.join(rootFolder, "test_world", "datapacks"),
                },
            ],
        };
        const result = await getDatapacksResources(path.join(rootFolder, "test_world", "datapacks"));
        result.datapacks.sort((a, b) => a.name.length - b.name.length);
        assert.deepEqual(result, expected);
    });
});
