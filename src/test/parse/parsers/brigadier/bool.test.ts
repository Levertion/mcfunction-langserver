import * as assert from "assert";
import { StringReader } from "../../../../brigadier_components/string_reader";
import * as boolArgumentParser from "../../../../parse/parsers/brigadier/bool";
import { CommmandData, ParserInfo } from "../../../../types";

describe("Boolean Argument Parser", () => {
    const properties: ParserInfo = { key: "test", node_properties: {}, data: {} as CommmandData };
    describe("parse()", () => {
        it("should not throw an error when it is reading true", () => {
            const reader = new StringReader("true");
            assert.doesNotThrow(() => boolArgumentParser.parse(reader, properties));
        });
        it("should not throw an error when it is reading false", () => {
            const reader = new StringReader("false");
            assert.doesNotThrow(() => boolArgumentParser.parse(reader, properties));
        });
        it("should throw an error if it is not reading true or false", () => {
            const reader = new StringReader("notbool");
            assert.throws(() => boolArgumentParser.parse(reader, properties));
        });
    });
    describe("getSuggestions()", () => {
        it("it should suggest the boolean which start begins", () => {
            assert.deepEqual(boolArgumentParser.getSuggestions("fals", properties), ["false"]);
            assert.deepEqual(boolArgumentParser.getSuggestions("tru", properties), ["true"]);
        });
        it("should suggest both true and false when it gets an empty start", () => {
            assert.deepEqual(boolArgumentParser.getSuggestions("", properties), ["true", "false"]);
        });
        it("should suggest the full boolean if it is given a full bool.", () => {
            assert.deepEqual(boolArgumentParser.getSuggestions("true", properties), ["true"]);
            assert.deepEqual(boolArgumentParser.getSuggestions("false", properties), ["false"]);
        });
    });
});
