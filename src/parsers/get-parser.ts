import { CommandNode } from "../data/types";
import { Parser } from "../types";

import * as brigadierParsers from "./brigadier";
import { literalParser } from "./literal";
import * as blockParsers from "./minecraft/block";
import { jsonParser } from "./minecraft/component";
import * as coordParsers from "./minecraft/coordinates";
import * as itemParsers from "./minecraft/item";
import * as listParsers from "./minecraft/lists";
import { messageParser } from "./minecraft/message";
import * as namespaceParsers from "./minecraft/namespace-list";
import { nbtPathParser } from "./minecraft/nbt-path";
import { nbtParser } from "./minecraft/nbt/nbt";
import { floatRange, intRange } from "./minecraft/range";
import { functionParser, resourceParser } from "./minecraft/resources";
import {
    criteriaParser,
    objectiveParser,
    teamParser
} from "./minecraft/scoreboard";
import { swizzleParer } from "./minecraft/swizzle";
import { timeParser } from "./minecraft/time";

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
    "minecraft:column_pos": coordParsers.columnPos,
    "minecraft:component": jsonParser,
    "minecraft:dimension": namespaceParsers.dimensionParser,
    "minecraft:entity_anchor": listParsers.entityAnchorParser,
    "minecraft:entity_summon": namespaceParsers.summonParser,
    "minecraft:float_range": floatRange,
    "minecraft:function": functionParser,
    "minecraft:int_range": intRange,
    "minecraft:item_enchantment": namespaceParsers.enchantmentParser,
    "minecraft:item_predicate": itemParsers.predicate,
    "minecraft:item_slot": listParsers.itemSlotParser,
    "minecraft:item_stack": itemParsers.stack,
    "minecraft:message": messageParser,
    "minecraft:mob_effect": namespaceParsers.mobEffectParser,
    "minecraft:nbt": nbtParser,
    // TODO: determine if nbt-path is ever used
    "minecraft:nbt-path": nbtPathParser,
    "minecraft:nbt_compound_tag": nbtParser,
    "minecraft:nbt_path": nbtPathParser,
    "minecraft:nbt_tag": nbtParser,
    "minecraft:objective": objectiveParser,
    "minecraft:objective_criteria": criteriaParser,
    "minecraft:operation": listParsers.operationParser,
    "minecraft:particle": namespaceParsers.particleParser,
    "minecraft:resource_location": resourceParser,
    "minecraft:rotation": coordParsers.rotation,
    "minecraft:scoreboard_slot": listParsers.scoreBoardSlotParser,
    "minecraft:swizzle": swizzleParer,
    "minecraft:team": teamParser,
    "minecraft:time": timeParser,
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
