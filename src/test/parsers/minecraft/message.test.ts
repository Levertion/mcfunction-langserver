import * as assert from "assert";
import { StringReader } from "../../../brigadier_components/string_reader";
import * as parser from "../../../parsers/minecraft/message";
import { ParserInfo } from "../../../types";

describe("Message parser", () => {
    it("should set the cursor to the correct position", () => {
        const reader = new StringReader("say this is a super fun string");
        reader.cursor = 4;
        parser.parse(reader, {} as ParserInfo);
        assert.strictEqual(reader.cursor, 30);
    });
});
