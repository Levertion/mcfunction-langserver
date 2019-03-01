import { NBTNode } from "mc-nbt-paths";

import { EntityBase } from "../../../parsers/minecraft/entity";
import { CommandData } from "../../../types";
import { snapshot, testParser } from "../../assertions";

describe("entity parser", () => {
    it("should parse player names", () => {
        const parser = new EntityBase(false, false);
        const playerTester = testParser(parser)();
        snapshot(playerTester, "FooBar", "");
    });
    it("should parse UUIDS", () => {
        const parser = new EntityBase(false, false);
        const uuidTester = testParser(parser)();
        snapshot(
            uuidTester,
            "f65c863a-747e-4fac-9828-33c3e825d00d",
            "ec-0-0-0-1"
        );
    });
    it("should suggest players in the scoreboard", () => {
        const parser = new EntityBase(true, false);
        const fakePlayerTester = testParser(parser)({
            data: {
                localData: {
                    nbt: {
                        scoreboard: {
                            data: {
                                PlayerScores: [
                                    {
                                        Name: "Player1"
                                    },
                                    {
                                        Name: "Player2"
                                    }
                                ]
                            }
                        }
                    }
                }
            } as CommandData
        });
        snapshot(fakePlayerTester, "Player1", "");
    });
    describe("entity selectors", () => {
        const parser = new EntityBase(false, true);
        const testerBuilder = testParser(parser);
        it("should parse basic selectors", () => {
            const basicSelectorTester = testerBuilder();
            snapshot(basicSelectorTester, "@p", "@p", "@", "");
        });
        it("should parse inputs with arguments", () => {
            const argumentTester = testerBuilder({
                data: {
                    globalData: {
                        nbt_docs: new Map<string, NBTNode>([
                            [
                                "root.json",
                                {
                                    children: {
                                        "minecraft:cow": {
                                            children: {
                                                foo: {
                                                    type: "string"
                                                }
                                            },
                                            type: "compound"
                                        },
                                        none: {
                                            children: {
                                                key: {
                                                    type: "string"
                                                }
                                            },
                                            type: "compound"
                                        }
                                    },
                                    type: "root"
                                }
                            ]
                        ]),
                        registries: {
                            "minecraft:entity_type": new Set(["minecraft:cow"])
                        }
                    }
                } as CommandData
            });
            snapshot(
                argumentTester,
                "@a[]",
                "@e[",
                "@e[x=12]",
                "@e[x=30000000]",
                "@p[x=10,x=13]",
                "@a[dx=123]",
                "@p[gamemode=survival]",
                "@a[gamemode=error]",
                "@p[gamemode=",
                "@a[gamemode=creative,gamemode=creative]",
                "@a[gamemode=survival,gamemode=!survival]",
                "@e[tag=foo]",
                "@a[tag=one,tag=two,tag=three]",
                "@p[tag=foo,tag=!foo]",
                "@r[tag=foo,tag=]",
                "@e[tag=]",
                "@e[type=cow]"
            );
        });
    });
});
