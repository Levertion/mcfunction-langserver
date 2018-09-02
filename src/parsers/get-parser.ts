/* tslint:disable:no-require-imports */

import { CommandNode } from "../data/types";
import { Parser } from "../types";

import * as literalParser from "./literal";
import * as blockParsers from "./minecraft/block";
import * as coordParsers from "./minecraft/coordinates";
import * as itemParsers from "./minecraft/item";

/**
 * Incomplete:
 * https://github.com/Levertion/mcfunction-langserver/projects/1
 */
const implementedParsers: { [id: string]: Parser } = {
    "brigadier:bool": require("./brigadier/bool"),
    "brigadier:float": require("./brigadier/float"),
    "brigadier:integer": require("./brigadier/integer"),
    "brigadier:string": require("./brigadier/string"),
    "minecraft:block_pos": coordParsers.blockPos,
    "minecraft:block_predicate": blockParsers.predicateParser,
    "minecraft:block_state": blockParsers.stateParser,
    "minecraft:color": require("./minecraft/list/color"),
    "minecraft:entity_anchor": require("./minecraft/list/entity-anchor"),
    "minecraft:item_enchantment": require("./minecraft/list/item-enchantment"),
    "minecraft:item_predicate": itemParsers.predicate,
    "minecraft:item_slot": require("./minecraft/list/item-slot"),
    "minecraft:item_stack": itemParsers.stack,
    "minecraft:message": require("./minecraft/message"),
    "minecraft:mob_effect": require("./minecraft/list/mob-effect"),
    "minecraft:operation": require("./minecraft/list/operation"),
    "minecraft:particle": require("./minecraft/list/particle"),
    "minecraft:rotation": coordParsers.rotation,
    "minecraft:scoreboard_slot": require("./minecraft/list/scoreboard-slot"),
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
        !!global.mcLangSettings && // Protection for tests when settings are undefined
        !!global.mcLangSettings.parsers &&
        global.mcLangSettings.parsers.hasOwnProperty(id)
    ) {
        try {
            return require(global.mcLangSettings.parsers[id]);
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
