import { getResourcesofType } from "../../misc-functions/group-resources";
import { CommmandData } from "../../types";
import { assertNamespaces } from "../assertions";

const dummyData: CommmandData = {
    globalData: {
        resources: {
            advancements: [
                {
                    namespace: "minecraft",
                    path: "test"
                }
            ],
            functions: [{ namespace: "minecraft", path: "test2" }]
        }
    } as any,
    localData: {
        current: 0,
        location: "",
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
                { namespace: "minecraft", path: "test" },
                { namespace: "local", path: "test" },
                { namespace: "local", path: "testfolder/testchild" },
                { namespace: "other", path: "secondtest" },
                { namespace: "secondpath", path: "path" }
            ],
            result
        );
    });
});
