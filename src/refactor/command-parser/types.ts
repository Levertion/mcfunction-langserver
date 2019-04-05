import { LanguageService } from "vscode-json-languageservice";

import { Level, Scoreboard } from "./nbt-types";
import { IDMap, IdSet } from "./parsers/shared/id-map";

// tslint:disable-next-line: interface-name
export interface ID {
    namespace?: string;
    path: string;
}

export type DataPackID = number;
// Undefined represents Vanilla's data
export type DataPackReference = DataPackID | undefined;

export interface McmetaFile {
    pack?: { description?: string; pack_format?: number };
}

export interface Tag {
    replace?: boolean;
    values: string[];
}

export interface Advancement {
    criteria: Set<string>;
}

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

export interface Datapack {
    id: DataPackID;
    mcmeta?: McmetaFile;
    name: string;
    world: string;
}

export type RegistryData = Record<RegistryNames, IdSet>;

export interface WorldNBT {
    level?: Level;
    scoreboard?: Scoreboard;
}

export interface CommandTree {
    children: Record<string, CommandTree>;
    executable?: boolean;
    /**
     * The parser for this node. Only Applicable if type of argument
     */
    parser?: string;
    properties?: Dictionary<any>;
    redirect?: string[];
    type: "literal" | "argument" | "root";
}

export type Blocks = IDMap<Map<string, Set<string>>>;

export interface WorldInfo {
    datapacksFolder: string;
    nbt: WorldNBT;
    packnamesmap: Map<string, DataPackID>;
}

export interface CommandData {
    blocks: Blocks;
    commands: CommandTree;
    data_info: { version: string };
    jsonService: LanguageService;
    nbt_docs: NBTDocs;
    packs: Map<DataPackID, Datapack>;
    registries: RegistryData;
    resources: Resources;
    worlds: Map<string, WorldInfo>;
}

export interface LineRange {
    end: number;
    start: number;
}

export type PackMap<T> = Map<DataPackReference, T>;

export type ResourcesMap<T = undefined, R = undefined> = IDMap<
    PackMap<T | undefined>,
    R,
    CommandData
>;
// Used for tags

export interface ResolvedTag {
    /**
     * Directly referenced types
     */
    finals: IdSet;
    /**
     * Resolved types
     */
    resolved: IdSet;
    /**
     * Tags referenced
     */
    tags: IdSet;
}

export type TagMap = ResourcesMap<Tag, ResolvedTag>;

export interface Resources {
    advancements: ResourcesMap<Advancement>;
    block_tags: TagMap;
    entity_tags: TagMap;
    fluid_tags: TagMap;
    function_tags: TagMap;
    functions: ResourcesMap;
    item_tags: TagMap;
    loot_tables: ResourcesMap;
    recipes: ResourcesMap;
    structures: ResourcesMap;
}

export interface ParserInfo {
    /**
     * The immutable context
     */
    context: CommandContext;
    data: CommandData;
    node_properties: Dictionary<any>;
    path: CommandNodePath; // Will be > 0
    /**
     * When suggesting, the end of the reader's string will be the cursor position
     */
    suggesting: boolean;
}

/**
 * A change to the shared context
 */
export type ContextChange = Partial<CommandContext> | undefined;

export interface CommandContext {
    // [key: string]: any;
    /**
     * What we know about the executor of the commmand.
     *
     * TODO: Possibly allow specifying this within a function as a sort of shebang,
     * then validate all function calls with this requirement
     */
    executor?: EntityInfo;
    /**
     * The result from an nbt path
     */
    nbt_path?: TypedNode["type"];
    /**
     * A different entity which is important during parsing
     */
    otherEntity?: EntityInfo;
}

export interface EntityInfo {
    /**
     * The possible entity types of this entity
     */
    ids?: ID[];
}
