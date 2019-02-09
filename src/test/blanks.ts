import { Range } from "vscode-languageserver";

import { GlobalData } from "../data/types";
import { PackLocationSegments } from "../misc-functions";
import { CommandData, LineRange } from "../types";
import { ReturnAssertionInfo, TestParserInfo } from "./assertions";

/**
 * Blank items for testing
 */

// tslint:disable-next-line:variable-name This allows for the property declaration shorthand
export const pack_segments: PackLocationSegments = {
    pack: "",
    packsFolder: "",
    rest: ""
};

export const succeeds: ReturnAssertionInfo = { succeeds: true };

export const emptyRange = (): LineRange => ({ start: 0, end: 0 });
export const blankproperties: TestParserInfo = {
    context: {},
    data: {} as CommandData,
    node_properties: {},
    path: ["test"]
};

const set = new Set();
export const emptyGlobal: GlobalData = {
    blocks: {},
    commands: { type: "root" },
    jsonService: undefined as any,
    meta_info: { version: "" },
    nbt_docs: new Map(),
    registries: {
        // tslint:disable:object-literal-sort-keys - very little value
        "minecraft:block": set,
        "minecraft:fluid": set,
        "minecraft:sound_event": set,
        "minecraft:mob_effect": set,
        "minecraft:enchantment": set,
        "minecraft:entity_type": set,
        "minecraft:item": set,
        "minecraft:potion": set,
        "minecraft:carver": set,
        "minecraft:surface_builder": set,
        "minecraft:feature": set,
        "minecraft:decorator": set,
        "minecraft:biome": set,
        "minecraft:particle_type": set,
        "minecraft:biome_source_type": set,
        "minecraft:block_entity_type": set,
        "minecraft:chunk_generator_type": set,
        "minecraft:dimension_type": set,
        "minecraft:motive": set,
        "minecraft:custom_stat": set,
        "minecraft:chunk_status": set,
        "minecraft:structure_feature": set,
        "minecraft:structure_piece": set,
        "minecraft:rule_test": set,
        "minecraft:structure_processor": set,
        "minecraft:structure_pool_element": set,
        "minecraft:menu": set,
        "minecraft:recipe_type": set,
        "minecraft:recipe_serializer": set,
        "minecraft:stat_type": set,
        "minecraft:villager_type": set,
        "minecraft:villager_profession": set
        // tslint:enable:object-literal-sort-keys
    },
    resources: {}
};

export const blankRange: Range = {
    end: { line: 0, character: 0 },
    start: { line: 0, character: 0 }
};
