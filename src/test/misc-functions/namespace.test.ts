import * as assert from "assert";
import { NamespacedName } from "../../data/types";
import {
    convertToNamespace,
    namespacesEqual,
    stringifyNamespace
} from "../../misc-functions/namespace";

describe("Namespace Functions (Misc)", () => {
    describe("namespacesEqual()", () => {
        it("should return true if the names are equal", () => {
            const name: NamespacedName = {
                namespace: "namespace",
                path: "testpath"
            };
            assert(
                namespacesEqual(name, {
                    namespace: "namespace",
                    path: "testpath"
                })
            );
        });
        it("should return false if the namespaces aren't equal", () => {
            const name: NamespacedName = {
                namespace: "namespace1",
                path: "testpath"
            };
            assert(
                !namespacesEqual(name, {
                    namespace: "namespace2",
                    path: "testpath"
                })
            );
        });
        it("should return false if the paths aren't equal", () => {
            const name: NamespacedName = {
                namespace: "namespace",
                path: "testpath1"
            };
            assert(
                !namespacesEqual(name, {
                    namespace: "namespace",
                    path: "testpath2"
                })
            );
        });
    });
    describe("convertToNamespace()", () => {
        it("should convert a regular namespaced name", () => {
            const expected: NamespacedName = {
                namespace: "namespace",
                path: "path"
            };
            assert.deepEqual(convertToNamespace("namespace:path"), expected);
        });
        it("should have no namespace if there is no namespace", () => {
            const expected: NamespacedName = { path: "pathonly" };
            assert.deepEqual(convertToNamespace("pathonly"), expected);
        });
        it("should have no namespace if the namespace is empty", () => {
            // This bug/feature(?): https://bugs.mojang.com/browse/MC-125100
            const expected: NamespacedName = { path: "pathonly" };
            assert.deepEqual(convertToNamespace(":pathonly"), expected);
        });
    });
    describe("stringifyNamespace()", () => {
        it("should convert a normal namespace", () => {
            assert.equal(
                stringifyNamespace({ path: "path", namespace: "namespace" }),
                "namespace:path"
            );
        });
        it("should use the default namespace with a non-specified namespace", () => {
            assert.equal(
                stringifyNamespace({ path: "path" }),
                "minecraft:path"
            );
        });
    });
});
describe("convertToNamespace()", () => {
    it("should convert a regular namespaced name", () => {
        const expected: NamespacedName = {
            namespace: "namespace",
            path: "path"
        };
        assert.deepStrictEqual(convertToNamespace("namespace:path"), expected);
    });
    it("should have no namespace if there is no namespace", () => {
        const expected: NamespacedName = { path: "pathonly" };
        assert.deepStrictEqual(convertToNamespace("pathonly"), expected);
    });
    it("should have no namespace if the namespace is empty", () => {
        // This bug/feature(?): https://bugs.mojang.com/browse/MC-125100
        const expected: NamespacedName = { path: "pathonly" };
        assert.deepStrictEqual(convertToNamespace(":pathonly"), expected);
    });
});
describe("stringifyNamespace()", () => {
    it("should convert a normal namespace", () => {
        assert.strictEqual(
            stringifyNamespace({ path: "path", namespace: "namespace" }),
            "namespace:path"
        );
    });
    it("should use the default namespace with a non-specified namespace", () => {
        assert.strictEqual(
            stringifyNamespace({ path: "path" }),
            "minecraft:path"
        );
    });
});
describe("convertToNamespace()", () => {
    it("should convert a regular namespaced name", () => {
        const expected: NamespacedName = {
            namespace: "namespace",
            path: "path"
        };
        assert.deepStrictEqual(convertToNamespace("namespace:path"), expected);
    });
    it("should have no namespace if there is no namespace", () => {
        const expected: NamespacedName = { path: "pathonly" };
        assert.deepStrictEqual(convertToNamespace("pathonly"), expected);
    });
    it("should have no namespace if the namespace is empty", () => {
        // This bug/feature(?): https://bugs.mojang.com/browse/MC-125100
        const expected: NamespacedName = { path: "pathonly" };
        assert.deepStrictEqual(convertToNamespace(":pathonly"), expected);
    });
});
describe("stringifyNamespace()", () => {
    it("should convert a normal namespace", () => {
        assert.strictEqual(
            stringifyNamespace({ path: "path", namespace: "namespace" }),
            "namespace:path"
        );
    });
    it("should use the default namespace with a non-specified namespace", () => {
        assert.strictEqual(
            stringifyNamespace({ path: "path" }),
            "minecraft:path"
        );
    });
});
