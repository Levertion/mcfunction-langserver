import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import {
    namespaceStart,
    parseNamespace,
    readNamespaceText
} from "../../../misc_functions/parsing/namespace";
import { returnAssert } from "../../assertions";
import { succeeds } from "../../blanks";

describe("Namespace Parsing Functions", () => {
    describe("namespaceStarts()", () => {
        describe("test namespace defined", () => {
            it("should allow same namespace, starting path", () => {
                assert(
                    namespaceStart(
                        { namespace: "test", path: "testing" },
                        { namespace: "test", path: "test" }
                    )
                );
            });
            it("should disallow different namespace, starting path", () => {
                assert(
                    !namespaceStart(
                        { namespace: "test", path: "testing" },
                        { namespace: "other", path: "test" }
                    )
                );
            });
        });
        describe("test namespace undefined", () => {
            it("should allow a starting path with the default namespace", () => {
                assert(
                    namespaceStart(
                        { namespace: "minecraft", path: "testing" },
                        { path: "test" }
                    )
                );
            });
            it("should disallow a starting path with a non-default namespace", () => {
                assert(
                    !namespaceStart(
                        { namespace: "other", path: "testing" },
                        { path: "test" }
                    )
                );
            });
            it("should allow a namespace starting with the path", () => {
                assert(
                    namespaceStart(
                        { namespace: "testing", path: "path" },
                        { path: "test" }
                    )
                );
            });
        });
    });
    describe("readNamespaceText()", () => {
        it("should read the namespace text", () => {
            const reader = new StringReader("mc:test[]");
            assert.strictEqual(readNamespaceText(reader), "mc:test");
            assert.strictEqual(reader.cursor, 7);
        });
    });
    describe("parseNamespace", () => {
        describe("Valid path", () => {
            it("should parse a namespace successfully, accepting it if it's a valid option", () => {
                const reader = new StringReader("mc:succeeds");
                const result = parseNamespace(
                    reader,
                    [{ namespace: "mc", path: "succeeds" }],
                    false
                );
                if (returnAssert(result, succeeds)) {
                    assert.deepStrictEqual(result.data, {
                        namespace: "mc",
                        path: "succeeds"
                    });
                }
            });
            it("should parse a namespace successfully, reject it if it's an invalid option", () => {
                const reader = new StringReader("mc:fails");
                const result = parseNamespace(
                    reader,
                    [{ namespace: "mc", path: "succeeds" }],
                    false
                );
                if (!returnAssert(result, { succeeds: false })) {
                    assert.deepStrictEqual(result.data, {
                        namespace: "mc",
                        path: "fails"
                    });
                }
            });
        });
        describe("Invalid path", () => {
            it("should fail, giving the correct error", () => {
                const reader = new StringReader("mc:fail:surplus");
                const result = parseNamespace(reader, [], false);
                returnAssert(result, {
                    errors: [
                        {
                            code: "argument.id.invalid",
                            range: { start: 7, end: 8 }
                        }
                    ],
                    succeeds: false
                });
            });
            it("should fail with multiple errors", () => {
                const reader = new StringReader("mc:fail:surplus:");
                const result = parseNamespace(reader, [], false);
                returnAssert(result, {
                    errors: [
                        {
                            code: "argument.id.invalid",
                            range: { start: 7, end: 8 }
                        },
                        {
                            code: "argument.id.invalid",
                            range: { start: 15, end: 16 }
                        }
                    ],
                    succeeds: false
                });
            });
        });
    });
});
