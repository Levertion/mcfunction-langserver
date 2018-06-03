import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import * as integerArgumentParser from "../../../parsers/brigadier/integer";
import { ParserInfo } from "../../../types";
import { assertReturn, defined } from "../../assertions";

const defaultProperties: ParserInfo = {
  context: {},
  data: {} as any,
  node_properties: {},
  path: ["test"],
  suggesting: true
};

describe("Integer Argument Parser", () => {
  describe("parse", () => {
    function validIntTests(
      s: string,
      expectedNum: number,
      numEnd: number
    ): void {
      it("should succeed with an unconstrained value", () => {
        const reader = new StringReader(s);
        assert.doesNotThrow(() =>
          integerArgumentParser.parse(reader, defaultProperties)
        );
        assert.equal(reader.cursor, numEnd);
      });
      it("should fail with a value less than the minimum", () => {
        const reader = new StringReader(s);
        const properties: ParserInfo = {
          ...defaultProperties,
          node_properties: { min: expectedNum + 1 }
        };
        const result = integerArgumentParser.parse(reader, properties);
        assertReturn(defined(result), false, [
          {
            code: "argument.integer.low",
            range: { start: 0, end: numEnd }
          }
        ]);
      });
      it("should fail with a value more than the maximum", () => {
        const reader = new StringReader(s);
        const properties: ParserInfo = {
          ...defaultProperties,
          node_properties: { max: expectedNum - 1 }
        };
        const result = integerArgumentParser.parse(reader, properties);
        assertReturn(defined(result), false, [
          {
            code: "argument.integer.big",
            range: { start: 0, end: numEnd }
          }
        ]);
      });
    }
    describe("valid integer", () => {
      validIntTests("1234", 1234, 4);
    });
    describe("valid integer with space", () => {
      validIntTests("1234 ", 1234, 4);
    });
    it("should fail when the integer is bigger than the java max", () => {
      const reader = new StringReader("1000000000000000");
      const result = integerArgumentParser.parse(reader, defaultProperties);
      assertReturn(defined(result), false, [
        { code: "argument.integer.big", range: { start: 0, end: 16 } }
      ]);
    });
    it("should fail when the integer is less than the java min", () => {
      const reader = new StringReader("-1000000000000000");
      const result = integerArgumentParser.parse(reader, defaultProperties);
      assertReturn(defined(result), false, [
        { code: "argument.integer.low", range: { start: 0, end: 17 } }
      ]);
    });
  });
});
