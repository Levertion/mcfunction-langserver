import * as assert from "assert";
import { CommandErrorBuilder } from "../../../brigadier/errors";
import { GlobalData } from "../../../data/types";
import { ListParser } from "../../../parsers/minecraft/list/list";
import { Lists, ListSupplier } from "../../../parsers/minecraft/list/lists";
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

const alists: { [key: string]: string } = {
    "minecraft:color": "./lists/color",
    "minecraft:entity_anchor": "./lists/entity-anchor",
    "minecraft:item_enchantment": "./lists/enchantment",
    "minecraft:item_slot": "./lists/item-slot",
    "minecraft:mob_effect": "./lists/effect",
    "minecraft:operation": "./lists/operation",
    "minecraft:particle": "./lists/particle",
    "minecraft:scoreboard_slot": "./lists/scoreboard-slot"
};

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
        it("should have valid paths", () => {
            const list = new Lists();
            list.registerLists();
            for (const s of Object.keys(alists)) {
                assert.ok(list.getList(s) !== undefined);
            }
        });
    });
});
