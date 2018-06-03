import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import { ParserInfo } from "../../../types";
import { assertReturn, defined } from "../../assertions";
import * as dummyparser from "./dummy1_parser";

describe("dummyParser1", () => {
  describe("parse", () => {
    it("should read the specified number of characters", () => {
      const reader = new StringReader("test hello");
      const result = dummyparser.parse(reader, ({
        node_properties: { number: 4 }
      } as any) as ParserInfo);
      assertReturn(
        defined(result),
        true,
        [],
        ["hello", { text: "welcome", start: 2 }]
      );
      assert.equal(reader.cursor, 4);
    });

    it("should default to 3 when not given any properties", () => {
      const reader = new StringReader("test hello");
      const result = dummyparser.parse(reader, ({
        node_properties: {}
      } as any) as ParserInfo);
      assertReturn(
        defined(result),
        true,
        [],
        ["hello", { text: "welcome", start: 1 }]
      );
      assert.equal(reader.cursor, 3);
    });

    it("should not succeed if there is not enough room", () => {
      const reader = new StringReader("te");
      const result = dummyparser.parse(reader, ({
        node_properties: {}
      } as any) as ParserInfo);
      assertReturn(
        defined(result),
        false,
        [],
        ["hello", { text: "welcome", start: 1 }]
      );
    });
  });
});
