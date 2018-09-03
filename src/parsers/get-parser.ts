import { CommandNode } from "../data/types";
import { Parser } from "../types";

import * as brigadierParsers from "./brigadier";
import { literalParser } from "./literal";
import * as blockParsers from "./minecraft/block";
import * as coordParsers from "./minecraft/coordinates";
import * as itemParsers from "./minecraft/item";
import * as listParsers from "./minecraft/lists";
import { messageParser } from "./minecraft/message";

import { parser as NBTParser } from "./minecraft/nbt/nbt";

/**
 * Incomplete:
 * https://github.com/Levertion/mcfunction-langserver/projects/1
 */
const implementedParsers: { [id: string]: Parser } = {
    "brigadier:bool": brigadierParsers.boolParser,
    "brigadier:float": brigadierParsers.floatParser,
    "brigadier:integer": brigadierParsers.intParser,
    "brigadier:string": brigadierParsers.stringParser,
    "minecraft:block_pos": coordParsers.blockPos,
    "minecraft:block_predicate": blockParsers.predicateParser,
    "minecraft:block_state": blockParsers.stateParser,
    "minecraft:color": listParsers.colorParser,
    "minecraft:entity_anchor": listParsers.entityAnchorParser,
    "minecraft:item_enchantment": listParsers.enchantmentParser,
    "minecraft:item_predicate": itemParsers.predicate,
    "minecraft:item_slot": listParsers.itemSlotParser,
    "minecraft:item_stack": itemParsers.stack,
    "minecraft:message": messageParser,
    "minecraft:mob_effect": listParsers.mobEffectParser,
    "minecraft:nbt": NBTParser,
    "minecraft:nbt-path": require("./minecraft/nbt-path"),
    "minecraft:operation": listParsers.operationParser,
    "minecraft:particle": listParsers.particleParser,
    "minecraft:rotation": coordParsers.rotation,
    "minecraft:scoreboard_slot": listParsers.scoreBoardSlotParser,
    "minecraft:vec2": coordParsers.vec2,
    "minecraft:vec3": coordParsers.vec3
};

export function getParser(node: CommandNode): Parser | undefined {
    switch (node.type) {
        case "literal":
            return literalParser;
        case "argument":
            if (!!node.parser) {
                return getArgParser(node.parser);
            }
            break;
        default:
    }
    return undefined;
}

function getArgParser(id: string): Parser | undefined {
    if (
        !!global.mcLangSettings &&
        !!global.mcLangSettings.parsers &&
        global.mcLangSettings.parsers.hasOwnProperty(id)
    ) {
        try {
            return global.mcLangSettings.parsers[id];
        } catch (_) {
            mcLangLog(
                `${global.mcLangSettings.parsers[id]} could not be loaded`
            );
        }
    }
    if (implementedParsers.hasOwnProperty(id)) {
        return implementedParsers[id];
    }
    mcLangLog(`Argument with parser id ${id} has no associated parser.
Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues`);
    return undefined;
}
