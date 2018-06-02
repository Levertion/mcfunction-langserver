import * as assert from "assert";
import { ContextPath, resolvePaths } from "../../misc_functions/context";

describe("context tests", () => {
    describe("resolvePaths()", () => {
        type pth = ContextPath<string>;
        const arr: pth[] = [
            { data: "yay", path: ["foo1", "foo2", "foo3"] },
            { data: "fail", path: ["x", "k", "c", "d"] },
        ];
        it("should return the correct paths", () => {
            assert.equal(resolvePaths(arr, ["foo1", "foo2", "foo3"]), "yay");
        });
        it("should return undefined if it cannot find the path", () => {
            assert.equal(resolvePaths(arr, ["blip", "blop"]), undefined);
        });
    });
});
