import { StringReader } from "../../../brigadier_components/string_reader";
import * as boolArgumentParser from "../../../parsers/brigadier/bool";
import { CommmandData, ParserInfo } from "../../../types";
import { assertReturn, defined } from "../../assertions";

describe("Boolean Argument Parser", () => {
    const properties: ParserInfo = {
        context: {},
        data: {} as CommmandData,
        node_properties: {},
        path: ["test"],
        suggesting: true // Note that bool parser ignores suggesting
    };
    describe("parse()", () => {
        it("should not error when it is reading true", () => {
            const reader = new StringReader("true");
            const result = boolArgumentParser.parse(reader, properties);
            assertReturn(defined(result), true, [], ["true"]);
        });
        it("should not error when it is reading false", () => {
            const reader = new StringReader("false");
            const result = boolArgumentParser.parse(reader, properties);
            assertReturn(defined(result), true, [], ["false"]);
        });
        it("should error if it is not reading true or false", () => {
            const reader = new StringReader("notbool");
            const result = boolArgumentParser.parse(reader, properties);
            assertReturn(defined(result), false, [
                { code: "parsing.bool.invalid", range: { start: 0, end: 7 } }
            ]);
        });
    });
    it("should suggest false for a string beginning with it", () => {
        const reader = new StringReader("fal");
        const result = boolArgumentParser.parse(reader, properties);
        assertReturn(
            defined(result),
            false,
            [
                {
                    code: "parsing.bool.invalid",
                    range: { start: 0, end: 3 }
                }
            ],
            ["false"]
        );
    });
    it("should suggest true for a string beginning with it", () => {
        const reader = new StringReader("tru");
        const result = boolArgumentParser.parse(reader, properties);
        assertReturn(
            defined(result),
            false,
            [
                {
                    code: "parsing.bool.invalid",
                    range: { start: 0, end: 3 }
                }
            ],
            ["true"]
        );
    });
    it("should suggest both for an empty string", () => {
        const reader = new StringReader("");
        const result = boolArgumentParser.parse(reader, properties);
        assertReturn(
            defined(result),
            false,
            [
                {
                    code: "parsing.bool.invalid",
                    range: { start: 0, end: 0 }
                }
            ],
            ["true", "false"]
        );
    });
});
