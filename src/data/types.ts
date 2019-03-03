import { NBTNode, ValueList } from "mc-nbt-paths";
import { LanguageService } from "vscode-json-languageservice";

import { Level, Scoreboard } from "./nbt/nbt-types";

/**
 * Types for data
 */
//#region Namespace
// tslint:disable-next-line: interface-name
export interface ID {
    namespace?: string;
    path: string;
}

//#endregion
export type NBTDocs = Map<string, NBTNode | ValueList>;
export interface GlobalData {
    blocks: BlocksPropertyInfo;
    commands: CommandTree;
    jsonService: LanguageService;
    meta_info: { version: string };
    nbt_docs: NBTDocs;
    registries: RegistriesData;
    resources: Resources;
}

export type Cacheable = Pick<
    GlobalData,
    "commands" | "blocks" | "registries" | "meta_info" | "resources"
>;

export type RegistryNames =
    | "minecraft:sound_event"
    | "minecraft:fluid"
    | "minecraft:mob_effect"
    | "minecraft:block"
    | "minecraft:enchantment"
    | "minecraft:entity_type"
    | "minecraft:item"
    | "minecraft:potion"
    | "minecraft:carver"
    | "minecraft:surface_builder"
    | "minecraft:feature"
    | "minecraft:decorator"
    | "minecraft:biome"
    | "minecraft:particle_type"
    | "minecraft:biome_source_type"
    | "minecraft:block_entity_type"
    | "minecraft:chunk_generator_type"
    | "minecraft:dimension_type"
    | "minecraft:motive"
    | "minecraft:custom_stat"
    | "minecraft:chunk_status"
    | "minecraft:structure_feature"
    | "minecraft:structure_piece"
    | "minecraft:rule_test"
    | "minecraft:structure_processor"
    | "minecraft:structure_pool_element"
    | "minecraft:menu"
    | "minecraft:recipe_type"
    | "minecraft:recipe_serializer"
    | "minecraft:stat_type"
    | "minecraft:villager_type"
    | "minecraft:villager_profession";

export type RegistriesData = Record<RegistryNames, Set<string>>;

export interface WorldNBT {
    level?: Level;
    scoreboard?: Scoreboard;
}

export type NonCacheable = Pick<
    GlobalData,
    Exclude<keyof GlobalData, keyof Cacheable>
>;

//#region Command Tree
/**
 * A node with children.
 */
export interface MCNode<T> {
    children?: { [id: string]: T };
}

/**
 * The root of the commands.
 */
export interface CommandTree extends MCNode<CommandNode> {
    type: "root";
}

/**
 * The Path which describes the route taken to get to a node.
 */
export type CommandNodePath = string[];

/**
 * A node in the command tree.
 * See <https://gist.github.com/Dinnerbone/7370a2846953eee2d8fc64514fb76de8> for the format
 */
export interface CommandNode extends MCNode<CommandNode> {
    executable?: boolean;
    /**
     * The parser for this node. Only Applicable if type of argument
     */
    parser?: string;
    properties?: Dictionary<any>;
    redirect?: CommandNodePath;
    type: "literal" | "argument";
}

//#endregion Command Tree
//#region BlockInfo
/**
 * Available blocks
 */
export interface BlocksPropertyInfo {
    [blockID: string]: SingleBlockPropertyInfo;
}

export interface SingleBlockPropertyInfo {
    [property: string]: string[];
}
//#endregion
//#region Items
/**
 * The items which can be obtained.
 * All have the `minecraft:` prefix in default setup.
 */
export type AvailableItems = string[];
//#endregion
//#region Resources
export interface Datapack {
    data: Resources;
    id: DataPackID;
    mcmeta?: McmetaFile;
    name: string;
}

export interface McmetaFile {
    pack?: { description?: string; pack_format?: number };
}

export type DataPackID = number;

export interface WorldInfo {
    location: string;
    nbt: WorldNBT;
    packnamesmap: { [name: string]: DataPackID };
    packs: { [packID: number]: Datapack };
}

export interface LocalData extends WorldInfo {
    current: DataPackID;
}

export interface ResourceID extends ID {
    /**
     * Namespace will be defined for a MinecraftResource
     */
    namespace: string;
    /**
     * The datapack this resource is related to.
     * If undefined, must be the vanilla datapack
     */
    pack?: DataPackID;
}

export interface Resources {
    advancements?: ResourceID[];
    block_tags?: ResourceID[];
    entity_tags?: ResourceID[];
    fluid_tags?: ResourceID[];
    function_tags?: ResourceID[];
    functions?: ResourceID[];
    item_tags?: ResourceID[];
    loot_tables?: ResourceID[];
    recipes?: ResourceID[];
    structures?: ResourceID[];
}

export interface DataID<T> extends ResourceID {
    data?: T;
}

//#region Resource file description
export interface Tag {
    replace?: boolean;
    values: string[];
}

export interface Advancement {
    criteria: Dictionary<any>;
}
//#endregion
//#endregion
