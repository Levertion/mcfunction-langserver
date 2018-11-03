import { CommandNode } from "../data/types";
import { Parser } from "../types";

import * as brigadierParsers from "./brigadier";
import { literalParser } from "./literal";
import * as blockParsers from "./minecraft/block";
import * as coordParsers from "./minecraft/coordinates";
import * as itemParsers from "./minecraft/item";
import * as listParsers from "./minecraft/lists";
import { messageParser } from "./minecraft/message";
import * as namespaceParsers from "./minecraft/namespace-list";
import { parser as NBTPathParser } from "./minecraft/nbt-path";
import { nbtParser } from "./minecraft/nbt/nbt";
import { functionParser, resourceParser } from "./minecraft/resources";
import { objectiveParser, teamParser } from "./minecraft/scoreboard";

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
    "minecraft:dimension": namespaceParsers.dimensionParser,
    "minecraft:entity_anchor": listParsers.entityAnchorParser,
    "minecraft:entity_summon": namespaceParsers.summonParser,
    "minecraft:function": functionParser,
    "minecraft:item_enchantment": namespaceParsers.enchantmentParser,
    "minecraft:item_predicate": itemParsers.predicate,
    "minecraft:item_slot": listParsers.itemSlotParser,
    "minecraft:item_stack": itemParsers.stack,
    "minecraft:message": messageParser,
    "minecraft:mob_effect": namespaceParsers.mobEffectParser,
    "minecraft:nbt": nbtParser,
    "minecraft:nbt-path": NBTPathParser,
    "minecraft:nbt_compound_tag": nbtParser,
    "minecraft:nbt_path": NBTPathParser,
    // Duplication of nbt path is OK - nbt-path is 1.13 whereas nbt_path is 1.14
    "minecraft:nbt_tag": nbtParser,
    "minecraft:objective": objectiveParser,
    "minecraft:operation": listParsers.operationParser,
    "minecraft:particle": namespaceParsers.particleParser,
    "minecraft:resource_location": resourceParser,
    "minecraft:rotation": coordParsers.rotation,
    "minecraft:scoreboard_slot": listParsers.scoreBoardSlotParser,
    "minecraft:team": teamParser,
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
