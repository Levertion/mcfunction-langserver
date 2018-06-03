import * as assert from "assert";
import { NamespacedName } from "../../data/types";
import {
  exactifyNamespace,
  namespacesEqual
} from "../../misc_functions/namespace";

describe("Namespace Functions (Misc)", () => {
  describe("exactifyNamespace", () => {
    it("should make a normal namespaced name into an exact namespaced name", () => {
      assert.deepEqual(
        exactifyNamespace({ namespace: "test", path: "testpath" }),
        { namespace: "test", path: "testpath", exact: true }
      );
    });
  });
  describe("namespacesEqual()", () => {
    it("should return true if the names are equal", () => {
      const name: NamespacedName = { namespace: "namespace", path: "testpath" };
      assert(
        namespacesEqual(name, { namespace: "namespace", path: "testpath" })
      );
    });
    it("should return false if the namespaces aren't equal", () => {
      const name: NamespacedName = {
        namespace: "namespace1",
        path: "testpath"
      };
      assert(
        !namespacesEqual(name, { namespace: "namespace2", path: "testpath" })
      );
    });
    it("should return false if the paths aren't equal", () => {
      const name: NamespacedName = {
        namespace: "namespace",
        path: "testpath1"
      };
      assert(
        !namespacesEqual(name, { namespace: "namespace", path: "testpath2" })
      );
    });
  });
});
