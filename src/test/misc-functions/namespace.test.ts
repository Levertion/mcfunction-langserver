import * as assert from "assert";

import { ID } from "../../data/types";
import { convertToID, idsEqual, stringifyID } from "../../misc-functions/id";

describe("Namespace Functions (Misc)", () => {
    describe("namespacesEqual()", () => {
        it("should return true if the names are equal", () => {
            const name: ID = {
                namespace: "namespace",
                path: "testpath"
            };
            assert(
                idsEqual(name, {
                    namespace: "namespace",
                    path: "testpath"
                })
            );
        });
        it("should return false if the namespaces aren't equal", () => {
            const name: ID = {
                namespace: "namespace1",
                path: "testpath"
            };
            assert(
                !idsEqual(name, {
                    namespace: "namespace2",
                    path: "testpath"
                })
            );
        });
        it("should return false if the paths aren't equal", () => {
            const name: ID = {
                namespace: "namespace",
                path: "testpath1"
            };
            assert(
                !idsEqual(name, {
                    namespace: "namespace",
                    path: "testpath2"
                })
            );
        });
    });
    describe("convertToNamespace()", () => {
        it("should convert a regular namespaced name", () => {
            const expected: ID = {
                namespace: "namespace",
                path: "path"
            };
            assert.deepStrictEqual(convertToID("namespace:path"), expected);
        });
        it("should have no namespace if there is no namespace", () => {
            const expected: ID = { path: "pathonly" };
            assert.deepStrictEqual(convertToID("pathonly"), expected);
        });
        it("should have no namespace if the namespace is empty", () => {
            // This bug/feature(?): https://bugs.mojang.com/browse/MC-125100
            const expected: ID = { path: "pathonly" };
            assert.deepStrictEqual(convertToID(":pathonly"), expected);
        });
    });
    describe("stringifyNamespace()", () => {
        it("should convert a normal namespace", () => {
            assert.strictEqual(
                stringifyID({ path: "path", namespace: "namespace" }),
                "namespace:path"
            );
        });
        it("should use the default namespace with a non-specified namespace", () => {
            assert.strictEqual(stringifyID({ path: "path" }), "minecraft:path");
        });
    });
});
describe("convertToNamespace()", () => {
    it("should convert a regular namespaced name", () => {
        const expected: ID = {
            namespace: "namespace",
            path: "path"
        };
        assert.deepStrictEqual(convertToID("namespace:path"), expected);
    });
    it("should have no namespace if there is no namespace", () => {
        const expected: ID = { path: "pathonly" };
        assert.deepStrictEqual(convertToID("pathonly"), expected);
    });
    it("should have no namespace if the namespace is empty", () => {
        // This bug/feature(?): https://bugs.mojang.com/browse/MC-125100
        const expected: ID = { path: "pathonly" };
        assert.deepStrictEqual(convertToID(":pathonly"), expected);
    });
});
describe("stringifyNamespace()", () => {
    it("should convert a normal namespace", () => {
        assert.strictEqual(
            stringifyID({ path: "path", namespace: "namespace" }),
            "namespace:path"
        );
    });
    it("should use the default namespace with a non-specified namespace", () => {
        assert.strictEqual(stringifyID({ path: "path" }), "minecraft:path");
    });
});
describe("convertToNamespace()", () => {
    it("should convert a regular namespaced name", () => {
        const expected: ID = {
            namespace: "namespace",
            path: "path"
        };
        assert.deepStrictEqual(convertToID("namespace:path"), expected);
    });
    it("should have no namespace if there is no namespace", () => {
        const expected: ID = { path: "pathonly" };
        assert.deepStrictEqual(convertToID("pathonly"), expected);
    });
    it("should have no namespace if the namespace is empty", () => {
        // This bug/feature(?): https://bugs.mojang.com/browse/MC-125100
        const expected: ID = { path: "pathonly" };
        assert.deepStrictEqual(convertToID(":pathonly"), expected);
    });
});
describe("stringifyNamespace()", () => {
    it("should convert a normal namespace", () => {
        assert.strictEqual(
            stringifyID({ path: "path", namespace: "namespace" }),
            "namespace:path"
        );
    });
    it("should use the default namespace with a non-specified namespace", () => {
        assert.strictEqual(stringifyID({ path: "path" }), "minecraft:path");
    });
});
