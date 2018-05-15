import { getResourcesofType } from "../../misc_functions/group_resources";
import { CommmandData } from "../../types";
import { assertNamespaces } from "../assertions";

const dummyData: CommmandData = {
    globalData: {
        resources: {
            advancements: [
                {
                    resource_name: { namespace: "minecraft", path: "test" },
                },
            ],
        },
    } as any,
    localData: [{
        namespaces: {
            test: {
                advancements: [
                    { resource_name: { namespace: "test", path: "test" } },
                    { resource_name: { namespace: "test", path: "testfolder/testchild" } },
                ],
                functions: [{ resource_name: { namespace: "test", path: "hello/test" } }],
            },
        },
        path: "/home/datapacks/testpack",
    }],
};

describe("Group Resources (Misc)", () => {
    it("should collect the specified type of resource", () => {
        const result = getResourcesofType(dummyData, "advancements");
        assertNamespaces(result.map((v) => v.resource_name), [{ namespace: "minecraft", path: "test" },
        { namespace: "test", path: "test" }, { namespace: "test", path: "testfolder/testchild" }]);
    });
});
