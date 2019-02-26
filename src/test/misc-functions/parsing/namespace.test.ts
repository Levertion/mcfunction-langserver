import * as assert from "assert";

import { StringReader } from "../../../brigadier/string-reader";
import { convertToNamespace } from "../../../misc-functions";
import {
    namespaceStart,
    parseNamespace,
    parseNamespaceOption,
    readNamespaceText
} from "../../../misc-functions/parsing/namespace";
import { returnAssert } from "../../assertions";
import { succeeds } from "../../blanks";

describe("Namespace Parsing Functions", () => {
    describe("namespaceStarts()", () => {
        describe("test namespace defined", () => {
            it("should allow same namespace, starting path", () => {
                assert(
                    namespaceStart(
                        convertToNamespace("test:testing"),
                        convertToNamespace("test:test")
                    )
                );
            });
            it("should disallow different namespace, starting path", () => {
                assert(
                    !namespaceStart(
                        convertToNamespace("test:testing"),
                        convertToNamespace("other:test")
                    )
                );
            });
        });
        describe("test namespace undefined", () => {
            it("should allow a starting path with the default namespace", () => {
                assert(
                    namespaceStart(
                        convertToNamespace("minecraft:testing"),
                        convertToNamespace("test")
                    )
                );
            });
            it("should disallow a starting path with a non-default namespace", () => {
                assert(
                    !namespaceStart(
                        convertToNamespace("other:testing"),
                        convertToNamespace("test")
                    )
                );
            });
            it("should allow a namespace starting with the path", () => {
                assert(
                    namespaceStart(
                        convertToNamespace("testing:path"),
                        convertToNamespace("test")
                    )
                );
            });
        });

        describe("base namespace undefined", () => {
            it("should act as if there was a minecraft namespace", () => {
                assert(
                    namespaceStart(
                        convertToNamespace("hello"),
                        convertToNamespace("minecraft:he")
                    )
                );
                assert(
                    namespaceStart(
                        convertToNamespace("hello"),
                        convertToNamespace("he")
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
    describe("parseNamespaceOption()", () => {
        it("should allow a parsed option, suggesting that option", () => {
            const reader = new StringReader("mc:succeeds");
            const result = parseNamespaceOption(reader, [
                convertToNamespace("mc:succeeds")
            ]);
            if (
                returnAssert(result, {
                    succeeds: true,
                    suggestions: ["mc:succeeds"]
                })
            ) {
                assert.deepStrictEqual(result.data, {
                    literal: {
                        namespace: "mc",
                        path: "succeeds"
                    },
                    values: [
                        {
                            namespace: "mc",
                            path: "succeeds"
                        }
                    ]
                });
            }
        });
        it("should reject it if it's an invalid option", () => {
            const reader = new StringReader("mc:fails");
            const result = parseNamespaceOption(reader, [
                convertToNamespace("mc:succeeds")
            ]);
            if (!returnAssert(result, { succeeds: false })) {
                assert.deepStrictEqual(result.data, {
                    namespace: "mc",
                    path: "fails"
                });
            }
        });
        it("should fail with an invalid path", () => {
            const reader = new StringReader("mc:fail:surplus");
            const result = parseNamespaceOption(reader, []);
            returnAssert(result, {
                errors: [
                    {
                        code: "argument.id.invalid",
                        range: {
                            end: 8,
                            start: 7
                        }
                    }
                ],
                succeeds: false
            });
        });
    });
    describe("parseNamespace", () => {
        it("should fail with an invalid path", () => {
            const reader = new StringReader("mc:fail:surplus");
            const result = parseNamespaceOption(reader, []);
            if (
                !returnAssert(result, {
                    errors: [
                        {
                            code: "argument.id.invalid",
                            range: {
                                end: 8,
                                start: 7
                            }
                        }
                    ],
                    succeeds: false
                })
            ) {
                assert.strictEqual(result.data, undefined);
            }
        });
        it("should fail with multiple errors", () => {
            const reader = new StringReader("mc:fail:surplus:");
            const result = parseNamespace(reader);
            if (
                !returnAssert(result, {
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
                })
            ) {
                assert.deepStrictEqual(result.data, undefined);
            }
        });
        it("should succeed with a valid path", () => {
            const reader = new StringReader("mc:succeeds");
            const result = parseNamespace(reader);
            if (returnAssert(result, succeeds)) {
                assert.deepStrictEqual(result.data, {
                    namespace: "mc",
                    path: "succeeds"
                });
            }
        });
    });
});
