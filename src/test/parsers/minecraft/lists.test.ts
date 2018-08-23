import * as assert from "assert";
import { CommandErrorBuilder } from "../../../brigadier/errors";
import { GlobalData } from "../../../data/types";
import { ListParser } from "../../../parsers/minecraft/list/list";
import { Lists, ListSupplier } from "../../../parsers/minecraft/list/lists";
import { ParserInfo } from "../../../types";
import { testParser } from "../../assertions";

const supplier: ListSupplier & { inited: boolean } = {
    inited: false,
    get(): string[] {
        if (!this.inited) {
            assert.fail("supplier not inited");
        }
        return ["foo", "bar", "baz", "hello", "world"];
    },
    init(): void {
        this.inited = true;
    }
};

class TestList extends Lists {
    public registerLists(): void {
        supplier.init();
        this.suppliers = { "foo:bar": supplier };
    }
}

describe("list tests", () => {
    describe("parse()", () => {
        const parser = new ListParser(
            "foo:bar",
            new CommandErrorBuilder("arg.ex", "example error")
        );
        const lists = new TestList();
        lists.registerLists();
        const globalData = {
            static_lists: lists
        } as GlobalData;
        const parserInfo = {
            data: {
                globalData
            }
        } as ParserInfo;
        const tester = testParser(parser)(parserInfo);
        ["foo", "bar", "hello"].forEach(v =>
            it(`'${v}' should parse correctly`, () => {
                tester(v, {
                    succeeds: true,
                    suggestions: [
                        {
                            start: 0,
                            text: v
                        }
                    ]
                });
            })
        );
        it("should throw an error for a different input", () => {
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
    });
});
