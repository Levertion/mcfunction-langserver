import * as assert from "assert";
import * as path from "path";
import * as stringParser from "../../parsers/brigadier/string";
import { getParser } from "../../parsers/get_parser";
import * as literal from "../../parsers/literal";
import * as dummy1 from "./tests/dummy1_parser";

describe("getParser()", () => {
    it("should give the literal parser for a literal node", () => {
        const parser = getParser({ type: "literal" });
        assert.strictEqual(parser, literal);
    });
    it("should give the correct parser for a custom parser", () => {
        global.mcLangSettings = ({
            parsers: {
                "langserver:dummy1": path.join(
                    __dirname,
                    "tests",
                    "dummy1_parser"
                )
            }
        } as any) as McFunctionSettings;
        const parser = getParser({
            parser: "langserver:dummy1",
            type: "argument"
        });
        assert.strictEqual(parser, dummy1);
    });
    it("should give the correct parser for a builtin parser", () => {
        const parser = getParser({
            parser: "brigadier:string",
            type: "argument"
        });
        assert.strictEqual(parser, stringParser);
    });
});
