import { boolParser } from "../../../parsers/brigadier";
import { testParser } from "../../assertions";

const boolTester = testParser(boolParser);
const testWithBasicProps = boolTester();

describe("Boolean Argument Parser", () => {
    describe("parse()", () => {
        it("should not error when it is reading true", () => {
            testWithBasicProps("true", {
                succeeds: true,
                suggestions: ["true"]
            });
        });
        it("should not error when it is reading false", () => {
            testWithBasicProps("false", {
                succeeds: true,
                suggestions: ["false"]
            });
        });
        it("should error if it is not reading true or false", () => {
            testWithBasicProps("notbool", {
                errors: [
                    {
                        code: "parsing.bool.invalid",
                        range: { start: 0, end: 7 }
                    }
                ],
                succeeds: false
            });
        });
    });
    it("should suggest false for a string beginning with it", () => {
        testWithBasicProps("fal", {
            errors: [
                {
                    code: "parsing.bool.invalid",
                    range: { start: 0, end: 3 }
                }
            ],
            succeeds: false,
            suggestions: ["false"]
        });
    });
    it("should suggest true for a string beginning with it", () => {
        testWithBasicProps("tru", {
            errors: [
                {
                    code: "parsing.bool.invalid",
                    range: { start: 0, end: 3 }
                }
            ],
            succeeds: false,
            suggestions: ["true"]
        });
    });
    it("should suggest both for an empty string", () => {
        testWithBasicProps("", {
            errors: [
                {
                    code: "parsing.bool.invalid",
                    range: { start: 0, end: 0 }
                }
            ],
            succeeds: false,
            suggestions: ["true", "false"]
        });
    });
});
