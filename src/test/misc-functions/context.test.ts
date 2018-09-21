import * as assert from "assert";
import {
    ContextPath,
    resolvePaths,
    startPaths
} from "../../misc-functions/context";

describe("context tests", () => {
    type pth = ContextPath<string>;
    const options: pth[] = [
        { data: "yay", path: ["foo1", "foo2", "foo3"] },
        { data: "longer", path: ["1", "2", "3", "4"] },
        { data: "shorter", path: ["1"] }
    ];
    describe("resolvePaths()", () => {
        it("should return the correct paths", () => {
            assert.strictEqual(
                resolvePaths(options, ["foo1", "foo2", "foo3"]),
                "yay"
            );
        });
        it("should return undefined if it cannot find the path", () => {
            assert.strictEqual(
                resolvePaths(options, ["blip", "blop"]),
                undefined
            );
        });
    });
    describe("startPaths", () => {
        it("should return the correct value when an exact match is found", () => {
            assert.strictEqual(
                startPaths(options, ["foo1", "foo2", "foo3"]),
                "yay"
            );
        });
        it("should return undefined if it cannot find the path", () => {
            assert.strictEqual(
                startPaths(options, ["blip", "blop"]),
                undefined
            );
        });
        it("should allow an extended path", () => {
            assert.strictEqual(
                startPaths(options, ["foo1", "foo2", "foo3", "foo4"]),
                "yay"
            );
        });
        it("should give a longer path than a shorter path", () => {
            assert.strictEqual(
                startPaths(options, ["1", "2", "3", "4"]),
                "longer"
            );
        });
        it("should give a shorter path for part of a longer", () => {
            assert.strictEqual(startPaths(options, ["1", "2", "3"]), "shorter");
        });
        it("should give a longer path when there are too many characters", () => {
            assert.strictEqual(
                startPaths(options, ["1", "2", "3", "4", "5"]),
                "longer"
            );
        });
    });
});
