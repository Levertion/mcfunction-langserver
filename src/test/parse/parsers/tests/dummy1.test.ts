import * as assert from "assert";
import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { StringReader } from "../../../../brigadier_components/string_reader";
import * as dummyparser from "../../../../parse/parsers/tests/dummy1";
import { ParserInfo } from "../../../../types";

describe("dummyParser1", () => {
    describe("parse", () => {
        it("should read the specified number of characters", () => {
            const reader = new StringReader("test hello");
            const result = dummyparser.parse(reader, { node_properties: { number: 4 } } as any as ParserInfo);
            assert.deepEqual(result, { successful: true });
            assert.equal(reader.cursor, 4);
        });

        it("should default to 3 when not given any properties", () => {
            const reader = new StringReader("test hello");
            const result = dummyparser.parse(reader, { node_properties: {} } as any as ParserInfo);
            assert.deepEqual(result, { successful: true });
            assert.equal(reader.cursor, 3);
        });

        it("should not succeed if there is not enough room", () => {
            const reader = new StringReader("te");
            const result = dummyparser.parse(reader, { node_properties: {} } as any as ParserInfo);
            assert.deepEqual(result, { successful: false });
        });
    });
    describe("getSuggestions", () => {
        it("should give the completions", () => {
            assert.deepEqual(["hello", { start: 2, value: "test", kind: CompletionItemKind.Constructor }],
                dummyparser.getSuggestions("", {} as any as ParserInfo),
            );
        });
    });
});
