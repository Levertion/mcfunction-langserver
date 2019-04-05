/*
// TODO: This will be rewritten to use IdMap/IdSet
import { getResourcesofType } from "../../misc-functions/group-resources";
import { CommandData } from "../../types";
import { convertToResource, snapshot } from "../assertions";

const dummyData: CommandData = {
    globalData: {
        resources: {
            advancements: [
                {
                    namespace: "minecraft",
                    path: "test"
                }
            ],
            functions: [convertToResource("minecraft:test2")]
        }
    } as any,
    localData: {
        current: 0,
        location: "",
        nbt: {},
        packnamesmap: { testpack: 0, pack2: 1 },
        packs: {
            0: {
                data: {
                    advancements: [
                        {
                            namespace: "local",
                            pack: 0,
                            path: "test"
                        },
                        {
                            namespace: "local",
                            pack: 0,
                            path: "testfolder/testchild"
                        },
                        {
                            namespace: "other",
                            pack: 0,
                            path: "secondtest"
                        }
                    ]
                },
                id: 0,
                name: "testpack"
            },
            1: {
                data: {
                    advancements: [
                        { namespace: "secondpath", path: "path", pack: 1 }
                    ]
                },
                id: 1,
                name: "pack2"
            }
        }
    }
};

describe("Group Resources (Misc)", () => {
    it("should collect the specified type of resource", () => {
        const result = getResourcesofType(dummyData, "advancements");
        assertNamespaces(
            [
                convertToResource("minecraft:test"),
                convertToResource("local:test"),
                convertToResource("local:testfolder/testchild"),
                convertToResource("other:secondtest"),
                convertToResource("secondpath:path")
            ],
            result
        );
    });
});
 */
