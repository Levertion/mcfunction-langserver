import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "../../../parsers/minecraft/lists";
import { snapshot, testParser } from "../../assertions";

const list = ["foo", "bar", "baz", "hello", "world", "++"];

describe("list tests", () => {
    describe("parse()", () => {
        const parser = new ListParser(
            list,
            new CommandErrorBuilder("arg.ex", "example error")
        );

        const tester = testParser(parser)();
        it("should parse all of the values correctly", () => {
            snapshot(tester, ...list, "badinput", "");
        });
    });
});
