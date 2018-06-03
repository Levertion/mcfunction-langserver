import * as assert from "assert";

import {
  createCommandLines,
  createParserInfo,
  splitLines
} from "../../misc_functions/creators";
import { CommmandData, ParserInfo } from "../../types";

describe("Instance Creation Functions (Misc)", () => {
  describe("createCommandLines()", () => {
    it("should convert an array of strings into an array of Command Lines", () => {
      assert.deepStrictEqual(
        createCommandLines(["line number 1", "line number two"]),
        [{ text: "line number 1" }, { text: "line number two" }]
      );
    });
  });

  const data = {} as CommmandData;
  describe("createParserInfo", () => {
    it("should create a parser info based on a node's properties", () => {
      const expected: ParserInfo = {
        context: {},
        data,
        node_properties: { test: true },
        path: ["testpath"],
        suggesting: false
      };
      const result = createParserInfo(
        {
          properties: { test: true },
          type: "literal"
        },
        data,
        ["testpath"],
        {},
        false
      );
      assert.deepStrictEqual(result, expected);
    });
    it("should create a blank node properties if it doesn't exist", () => {
      const expected: ParserInfo = {
        context: {},
        data,
        node_properties: {},
        path: ["testpath"],
        suggesting: false
      };
      const result = createParserInfo(
        {
          type: "literal"
        },
        data,
        ["testpath"],
        {},
        false
      );
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("splitLines", () => {
    it("should convert a multiple line string", () => {
      assert.deepStrictEqual(
        splitLines("first line\nsecond line\nthird line"),
        [
          { text: "first line" },
          { text: "second line" },
          { text: "third line" }
        ]
      );
    });
    it("should create a single command line from a single line string", () => {
      assert.deepStrictEqual(splitLines("singleline"), [
        { text: "singleline" }
      ]);
    });
  });
});
