import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "../../../parsers/minecraft/lists";
import { testParser } from "../../assertions";

const list = ["foo", "bar", "baz", "hello", "world"];

describe("list tests", () => {
    describe("parse()", () => {
        const parser = new ListParser(
            list,
            new CommandErrorBuilder("arg.ex", "example error")
        );

        const tester = testParser(parser)();
        list.forEach(v =>
            it(`should parse '${v}' correctly`, () => {
                tester(v, {
                    succeeds: true,
                    suggestions: [v]
                });
            })
        );
        it("should fail for a different input", () => {
            tester("badinput", {
                errors: [
                    {
                        code: "arg.ex",
                        range: {
                            end: 8,
                            start: 0
                        }
                    }
                ],
                succeeds: false
            });
        });
        it("should suggest all values for an empty string", () => {
            tester("", {
                errors: [
                    {
                        code: "arg.ex",
                        range: {
                            end: 0,
                            start: 0
                        }
                    }
                ],
                succeeds: false,
                suggestions: list
            });
        });
    });
});
