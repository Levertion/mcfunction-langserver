import * as assert from "assert";
import { stringParser } from "../../parsers/brigadier";
import { getParser } from "../../parsers/get-parser";

import { literalParser } from "../../parsers/literal";
import { dummyParser } from "./tests/dummy1";

describe("getParser()", () => {
    it("should give the literal parser for a literal node", () => {
        const parser = getParser({ type: "literal" });
        assert.strictEqual(parser, literalParser);
    });
    it("should give the correct parser for a custom parser", () => {
        global.mcLangSettings = ({
            parsers: {
                "langserver:dummy1": dummyParser
            }
        } as any) as McFunctionSettings;
        const parser = getParser({
            parser: "langserver:dummy1",
            type: "argument"
        });
        assert.strictEqual(parser, dummyParser);
    });
    it("should give the correct parser for a builtin parser", () => {
        const parser = getParser({
            parser: "brigadier:string",
            type: "argument"
        });
        assert.strictEqual(parser, stringParser);
    });
});
