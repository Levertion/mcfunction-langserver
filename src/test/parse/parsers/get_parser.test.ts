import * as assert from "assert";
import { getParser } from "../../../parse/parsers/get_parser";
import * as literal from "../../../parse/parsers/literal";
import * as dummy1 from "../../../parse/parsers/tests/dummy1";

describe("getParser()", () => {
    it("should give the literal parser for a literal node", () => {
        const parser = getParser({ type: "literal" });
        assert.equal(parser, literal);
    });
    it("should give the correct parser for an argument node", () => {
        const parser = getParser({ type: "argument", parser: "langserver:dummy1" });
        assert.equal(parser, dummy1);
    });
});
