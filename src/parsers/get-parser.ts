import * as path from "path";
import { CommandNode } from "../data/types";
import { Parser } from "../types";

/**
 * Incomplete:
 * https://github.com/Levertion/mcfunction-langserver/projects/1
 */
const implementedParsers: { [id: string]: string } = {
    "brigadier:bool": "./brigadier/bool",
    "brigadier:float": "./brigadier/float",
    "brigadier:integer": "./brigadier/integer",
    "brigadier:string": "./brigadier/string",
    "minecraft:block_pos": "./minecraft/coord/block-pos",
    "minecraft:block_predicate": "./minecraft/block/predicate",
    "minecraft:block_state": "./minecraft/block/state",
    "minecraft:color": "./minecraft/list/color",
    "minecraft:entity_anchor": "./minecraft/list/entity-anchor",
    "minecraft:item_enchantment": "./minecraft/list/enchantment",
    "minecraft:item_predicate": "./minecraft/item/predicate",
    "minecraft:item_slot": "./minecraft/list/item-slot",
    "minecraft:item_stack": "./minecraft/item/item",
    "minecraft:message": "./minecraft/message",
    "minecraft:mob_effect": "./minecraft/list/effect",
    "minecraft:nbt": "./minecraft/nbt/nbt-parser",
    "minecraft:nbt_path": "./minecraft/nbt-path",
    "minecraft:operation": "./minecraft/list/operation",
    "minecraft:particle": "./minecraft/list/particle",
    "minecraft:rotation": "./minecraft/coord/rotation",
    "minecraft:scoreboard_slot": "./minecraft/list/scoreboard-slot",
    "minecraft:swizzle": "./minecraft/swizzle",
    "minecraft:vec2": "./minecraft/coord/vec2",
    "minecraft:vec3": "./minecraft/coord/vec3"
};

export function getParser(node: CommandNode): Parser | undefined {
    let parserPath = "";
    switch (node.type) {
        case "literal":
            parserPath = "./literal";
            break;
        case "argument":
            if (!!node.parser) {
                parserPath = getArgParserPath(node.parser);
            }
            break;
        default:
            mcLangLog(
                `Invalid node type: ${node.type} in ${JSON.stringify(node)}`
            );
    }
    if (parserPath.length > 0) {
        try {
            return require(parserPath);
        } catch (error) {
            mcLangLog(`No parser was found at ${parserPath}. Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues,\
along with: '${JSON.stringify(error)}'.`);
        }
    }
    return undefined;
}

function getArgParserPath(id: string): string {
    if (
        !!global.mcLangSettings && // Protection for tests when settings are undefined
        !!global.mcLangSettings.parsers &&
        global.mcLangSettings.parsers.hasOwnProperty(id)
    ) {
        return global.mcLangSettings.parsers[id];
    } else if (implementedParsers.hasOwnProperty(id)) {
        return path.join(__dirname, implementedParsers[id]);
    } else {
        mcLangLog(`Argument with parser id ${id} has no associated parser.
Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues`);
        return "";
    }
}
