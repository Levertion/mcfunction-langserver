import * as assert from "assert";
import * as path from "path";
import {
    getKindAndNamespace,
    getPath,
    parseDataPath
} from "../../misc_functions/datapack_folder";
import { unwrap } from "../assertions";

describe("parseDataPath() (Misc)", () => {
    it("should parse a path with a valid datapack (posix)", () => {
        assert.deepStrictEqual(
            parseDataPath("/home/datapacks/pack/folder/file.ext", path.posix),
            {
                pack: "pack",
                packsFolder: "/home/datapacks/",
                rest: "folder/file.ext"
            }
        );
    });
    it("should parse a path with a valid datapack (win32)", () => {
        assert.deepStrictEqual(
            parseDataPath(
                "C:\\Users\\username\\datapacks\\pack\\folder\\file.ext",
                path.win32
            ),
            {
                pack: "pack",
                packsFolder: "C:\\Users\\username\\datapacks\\",
                rest: "folder\\file.ext"
            }
        );
    });
    it("should allow a file directly within a datapack folder (posix)", () => {
        assert.deepStrictEqual(
            parseDataPath("/home/datapacks/pack/file.ext", path.posix),
            {
                pack: "pack",
                packsFolder: "/home/datapacks/",
                rest: "file.ext"
            }
        );
    });
    it("should allow a file directly within a datapack folder (win32)", () => {
        assert.deepStrictEqual(
            parseDataPath(
                "C:\\Users\\username\\datapacks\\pack\\file.ext",
                path.win32
            ),
            {
                pack: "pack",
                packsFolder: "C:\\Users\\username\\datapacks\\",
                rest: "file.ext"
            }
        );
    });
    it("should allow a path with / on windows (shouldn't ever be applicable)", () => {
        assert.deepStrictEqual(
            parseDataPath(
                "C:\\Users\\username/datapacks/pack/file.ext",
                path.win32
            ),
            {
                pack: "pack",
                packsFolder: "C:\\Users\\username\\datapacks\\",
                rest: "file.ext"
            }
        );
    });
    it("should not allow a file directly within the datapacks folder (posix)", () => {
        assert.strictEqual(
            parseDataPath("/home/datapacks/file.ext", path.posix),
            undefined
        );
    });
    it("should not allow a file directly within the datapacks folder (win32)", () => {
        assert.strictEqual(
            parseDataPath(
                "C:\\Users\\username\\datapacks\\file.ext",
                path.win32
            ),
            undefined
        );
    });
    it("should not allow a path without a datapacks folder (posix)", () => {
        assert.strictEqual(
            parseDataPath("/etc/tmp/other", path.posix),
            undefined
        );
    });
    it("should not allow a path without a datapacks folder (win32)", () => {
        assert.strictEqual(
            parseDataPath("C:\\Windows\\System32", path.win32),
            undefined
        );
    });
});

describe("getKindAndNamespace() (Misc)", () => {
    it("should get the correct kind and namespace (posix)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data/namespace/functions/path.mcfunction",
                path.posix
            ),
            {
                kind: "functions",
                location: { namespace: "namespace", path: "path" }
            }
        );
    });
    it("should get the correct kind and namespace (win32)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data\\namespace\\functions\\path.mcfunction",
                path.win32
            ),
            {
                kind: "functions",
                location: { namespace: "namespace", path: "path" }
            }
        );
    });
    it("should get allow a path with / (win32)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data/namespace/functions/path.mcfunction",
                path.win32
            ),
            {
                kind: "functions",
                location: { namespace: "namespace", path: "path" }
            }
        );
    });
    it("should get the correct kind and namespace with a slash (posix)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data/namespace/functions/segment/path.mcfunction",
                path.posix
            ),
            {
                kind: "functions",
                location: {
                    namespace: "namespace",
                    path: "segment/path"
                }
            }
        );
    });
    it("should get the correct kind and namespace with a slash (win32)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data\\namespace\\functions\\segment\\path.mcfunction",
                path.win32
            ),
            {
                kind: "functions",
                location: {
                    namespace: "namespace",
                    path: "segment/path"
                }
            }
        );
    });
    it("should get the correct kind when using a kind with multiple segments (posix)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data/namespace/tags/functions/segment/path.json",
                path.posix
            ),
            {
                kind: "function_tags",
                location: {
                    namespace: "namespace",
                    path: "segment/path"
                }
            }
        );
    });
    it("should get the correct kind when using a kind with multiple segments (win32)", () => {
        assert.deepStrictEqual(
            getKindAndNamespace(
                "data\\namespace\\tags\\functions\\segment\\path.json",
                path.win32
            ),
            {
                kind: "function_tags",
                location: {
                    namespace: "namespace",
                    path: "segment/path"
                }
            }
        );
    });
    it("should not allow a path without a data folder (posix)", () => {
        assert.strictEqual(
            getKindAndNamespace("notdata/namespace/functions/path", path.posix),
            undefined
        );
    });
    it("should not allow a path without a data folder (win32)", () => {
        assert.strictEqual(
            getKindAndNamespace(
                "notdata\\namespace\\functions\\path.mcfunction",
                path.win32
            ),
            undefined
        );
    });
    it("should not allow a path which is not a valid type (posix)", () => {
        assert.strictEqual(
            getKindAndNamespace(
                "data/namespace/random/path.mcfunction",
                path.posix
            ),
            undefined
        );
    });
    it("should not allow a path which is not a valid type (win32)", () => {
        assert.strictEqual(
            getKindAndNamespace(
                "data\\namespace\\random\\path.mcfunction",
                path.win32
            ),
            undefined
        );
    });
    it("should not allow a path with an invalid extension (posix)", () => {
        assert.strictEqual(
            getKindAndNamespace("data/namespace/functions/path.notfunction"),
            undefined
        );
    });
    it("should not allow a path with an invalid extension (win32)", () => {
        assert.strictEqual(
            getKindAndNamespace("data\\namespace\\functions\\path.notfunction"),
            undefined
        );
    });
});

describe("getPath() (Misc)", () => {
    function testGetPath(s: string, pthModule: typeof path.posix): void {
        const parsed = unwrap(parseDataPath(s, pthModule));
        const kindNspc = unwrap(getKindAndNamespace(parsed.rest, pthModule));
        const result = getPath(
            kindNspc.location,
            pthModule.join(parsed.packsFolder, parsed.pack),
            kindNspc.kind,
            pthModule
        );
        assert.strictEqual(s, result);
    }
    it("should give a correct path (posix)", () => {
        testGetPath(
            "/home/datapacks/pack/data/namespace/functions/path.mcfunction",
            path.posix
        );
    });
    it("should give a correct path (win32)", () => {
        testGetPath(
            "C:\\Users\\username\\datapacks\\pack\\data\\namespace\\functions\\path.mcfunction",
            path.win32
        );
    });
});
