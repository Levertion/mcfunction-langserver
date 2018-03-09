import { CommandNode } from "../../data/types";
import { Parser } from "../../types";

/**
 * Incomplete
 * "minecraft:block_pos"
 * "minecraft:block_predicate"
 * "minecraft:block_state"
 * "minecraft:color"
 * "minecraft:component"
 * "minecraft:entity"
 * "minecraft:entity_anchor"
 * "minecraft:function"
 * "minecraft:game_profile"
 * "minecraft:item_enchantment"
 * "minecraft:item_predicate"
 * "minecraft:item_slot"
 * "minecraft:item_stack"
 * "minecraft:message"
 * "minecraft:mob_effect"
 * "minecraft:nbt"
 * "minecraft:nbt_path"
 * "minecraft:objective"
 * "minecraft:objective_criteria"
 * "minecraft:operation"
 * "minecraft:particle"
 * "minecraft:range"
 * "minecraft:resource_location"
 * "minecraft:rotation"
 * "minecraft:score_holder"
 * "minecraft:scoreboard_slot"
 * "minecraft:swizzle"
 * "minecraft:team"
 * "minecraft:vec2"
 * "minecraft:vec3"
 */
const implementedParsers: { [id: string]: string } = {
    "brigadier:bool": "./brigadier/bool",
    "brigadier:float": "./brigadier/float",
    "brigadier:integer": "./brigadier/integer",
    "brigadier:string": "./brigadier/string",
    "langserver:dummy1": "./tests/dummy1",
};

export function getParser(node: CommandNode): Parser | undefined {
    let parserPath: string = "";
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
            mcLangLog(`Invalid node type: ${node.type} in ${
                JSON.stringify(node)}`);
            break;
    }
    if (parserPath.length > 0) {
        try {
            return require(parserPath);
        } catch (error) {
            mcLangLog(`No parser was found at ${parserPath
                }. Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues,\
along with: '${JSON.stringify(error)}'.`);
        }
    }
    return;
}

function getArgParserPath(id: string): string {
    if (implementedParsers.hasOwnProperty(id)) {
        return implementedParsers[id];
    } else {
        mcLangLog(`Argument with parser id ${id} has no associated parser.
Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues`);
        return "";
    }
}
