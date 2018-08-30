import * as assert from "assert";
import { CommandErrorBuilder } from "../../../brigadier/errors";
import { GlobalData } from "../../../data/types";
import { ListParser } from "../../../parsers/minecraft/list/list";
import {
    Lists,
    lists,
    ListSupplier
} from "../../../parsers/minecraft/list/lists";
import { ParserInfo } from "../../../types";
import { testParser } from "../../assertions";

const supplier: ListSupplier & { initialized: boolean } = {
    initialized: false,
    get(): string[] {
        if (!this.initialized) {
            assert.fail("supplier not inited");
        }
        return ["foo", "bar", "baz", "hello", "world"];
    },
    init(): void {
        this.initialized = true;
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
        const listsobj = new TestList();
        listsobj.registerLists();
        const globalData = {
            static_lists: listsobj
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
        it("should have valid paths", () => {
            const list = new Lists();
            list.registerLists();
            for (const s of Object.keys(lists)) {
                assert(!!list.getList(s));
            }
        });
    });
});
