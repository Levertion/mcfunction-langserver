import * as assert from "assert";
import * as path from "path";
import { getPacksInfo } from "../../data/datapack_resources";
import { Datapack, MinecraftResource, PacksInfo } from "../../data/types";
import { typed_keys } from "../../misc_functions/third_party/typed_keys";
import { assertMembers, assertNamespaces, returnAssert } from "../assertions";
import { succeeds } from "../blanks";

// Tests are run from within the lib folder, but data is in the root
const rootFolder = path.join(__dirname, "..", "..", "..", "test_data");
describe("Datapack Resource Testing", () => {
    it("should return the correct data", async () => {
        const datapacks = path.join(rootFolder, "test_world", "datapacks");
        const expected: { [pack: string]: Datapack } = {
            ExampleDatapack: {
                data: {
                    function_tags: [{ namespace: "minecraft", path: "tick" }],
                    functions: [
                        {
                            namespace: "test_namespace",
                            path: "function"
                        }
                    ]
                },
                id: 0,
                mcmeta: {
                    pack: { pack_format: 3, description: "test datapack" }
                }
            },
            ExampleDatapack2: {
                data: {
                    functions: [
                        {
                            namespace: "test_namespace",
                            path: "function"
                        }
                    ]
                },
                id: 1,
                mcmeta: {
                    pack: { pack_format: 3, description: "test datapack 2" }
                }
            }
        };
        const result = await getPacksInfo(
            path.join(rootFolder, "test_world", "datapacks")
        );
        returnAssert(result, succeeds);
        assertPacksInfo(result.data, datapacks, expected);
    });
});

function assertPacksInfo(
    result: PacksInfo,
    location: string,
    packs: { [key: string]: Datapack }
): void {
    assert.equal(result.location, location);
    for (const packName of Object.keys(packs)) {
        if (!result.packnamesmap.hasOwnProperty(packName)) {
            throw new assert.AssertionError({
                message: `Expected pack with name of ${packName}`
            });
        }
        const pack = packs[packName];
        const id = result.packnamesmap[packName];
        const actual = result.packs[id];
        assert.equal(actual.id, id);
        const keys = typed_keys(pack.data);
        assertMembers(keys, Object.keys(actual.data), (a, b) => a === b);

        for (const kind of keys) {
            const resources = pack.data[kind] as MinecraftResource[];
            const actualResources = actual.data[kind] as MinecraftResource[];
            assert(actualResources.every(v => v.pack === id));
            assertNamespaces(resources, actualResources);
        }
    }
}
