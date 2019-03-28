import { NBTNode, ValueList } from "mc-nbt-paths";
import { DataInterval, Interval, IntervalTree } from "node-interval-tree";
import {
    CompletionItem,
    JSONDocument,
    LanguageService
} from "vscode-json-languageservice";
import {
    CompletionItemKind,
    MarkupContent,
    TextDocument
} from "vscode-languageserver";

import { BlankCommandError, CommandError } from "./brigadier/errors";
import { StringReader } from "./brigadier/string-reader";
import { Level, Scoreboard } from "./data/nbt/nbt-types";
import { PackLocationSegments } from "./misc-functions";
import { IDMap, IdSet } from "./misc-functions/id-map";
import { TypedNode } from "./parsers/minecraft/nbt/util/doc-walker-util";

//#region Minecraft types

// tslint:disable-next-line: interface-name
export interface ID {
    namespace?: string;
    path: string;
}

export interface Tag {
    replace?: boolean;
    values: string[];
}

export interface Advancement {
    criteria: Set<string>;
}
export interface McmetaFile {
    pack?: { description?: string; pack_format?: number };
}

// Undefined represents minecraft
export type DataPackReference = DataPackID | undefined;
export type DataPackID = number;

export interface Datapack {
    id: DataPackID;
    mcmeta?: McmetaFile;
    name: string;
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

export type RegistryData = Record<RegistryNames, IdSet>;

export interface WorldNBT {
    level?: Level;
    scoreboard?: Scoreboard;
}

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
//#endregion

//#region Internal types
export type Blocks = IDMap<Map<string, Set<string>>>;
export interface CommandData {
    blocks: Blocks;
    commands: CommandTree;
    data_info: { version: string };
    jsonService: LanguageService;
    /**
     * Data from datapacks
     */
    localData?: LocalData;
    nbt_docs: NBTDocs;
    registries: RegistryData;
    resources: Resources;
}

export type NBTDocs = Map<string, NBTNode | ValueList>;

export interface WorldInfo {
    datapacksFolder: string;
    nbt: WorldNBT;
    packnamesmap: Map<string, DataPackID>;
    packs: Map<DataPackID, Datapack>;
}

export interface LocalData extends WorldInfo {
    // TODO: Is this used?
    current: DataPackReference;
}

export type PackMap<T> = Map<DataPackReference, T>;

export type ResourcesMap<T = undefined, R = undefined> = IDMap<
    PackMap<T | undefined>,
    R,
    CommandData
>;
// Used for tags

export interface Resolved<T, R> {
    resolved: R;
    resources: PackMap<T>;
}

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

export interface FunctionInfo {
    lines: CommandLine[];
    /**
     * The filesystem path to the `datapacks` folder this is part of - NOT the folder of the single datapack
     */
    pack_segments: PackLocationSegments | undefined;
}

export interface WorkspaceSecurity {
    // CustomParsers?: boolean;
    JarPath?: boolean;
    JavaPath?: boolean;
}

export interface CommandLine {
    /**
     * A cache of the tree of actions
     */
    actions?: IntervalTree<SubAction>;
    nodes?: IntervalTree<ParseNode>;
    parseInfo?: StoredParseResult | false;
    text: string;
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

export interface Suggestion extends Partial<CompletionItem> {
    description?: string | MarkupContent;
    label?: string;
    /**
     * The start from where value should be replaced. 0 indexed character gaps.
     * E.g. `@e[na` with the suggestion `{value:"name=",start:3}`
     * would make `@e[name=` when accepted.
     */
    start: number;
    text: string;
}

// If suggestion is a string, then it is from the start of the input
// TODO: Remove the string fallback
export type SuggestResult = Suggestion | string;

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

export interface Parser {
    /**
     * The default suggestion kind for suggestions from this parser
     */
    kind?: CompletionItemKind;
    /**
     * Parse the argument as described in NodeProperties against this parser in the reader.
     * Gets both suggestions and success
     */
    parse(
        reader: StringReader,
        properties: ParserInfo
    ): ReturnedInfo<ContextChange | undefined>;
}

export interface ParseNode extends Interval {
    context: CommandContext;
    final?: CommandContext;
    path: CommandNodePath;
}

export interface StoredParseResult {
    actions: SubAction[];
    errors: CommandError[];
    nodes: ParseNode[];
}

interface SubActionBase<U extends string, T> extends DataInterval<T> {
    type: U;
}

export interface JSONDocInfo {
    json: JSONDocument;
    text: TextDocument;
}

export type SubAction =
    | SubActionBase<"hover", string>
    | SubActionBase<"format", string>
    | SubActionBase<"source", string>
    | SubActionBase<"json", JSONDocInfo>;
//  | SubActionBase<"highlight", HighlightScope>;
//  | SubActionBase<"rename", RenameRequest>;

export type Success = true;
export const success: Success = true;

export const failure: Failure = false;
export type Failure = false;

export interface ReturnData<ErrorKind extends BCE = CE> {
    actions: SubAction[];
    errors: ErrorKind[];
    /**
     * Points not related to a specific line being parsed.
     * This includes errors inside a file for example.
     */
    misc: MiscInfo[];
    suggestions: SuggestResult[];
}

type MiscInfoBase<kind extends string, value> = value & {
    kind: kind;
};

export type MiscInfo =
    | MiscInfoBase<"FileError", FileError>
    | MiscInfoBase<"ClearError", ClearFileError>;

interface FileError {
    filePath: string;
    group: string;
    message: string;
}

interface ClearFileError {
    filePath: string;
    group?: string;
}

/**
 * A general return type which can either succeed or fail, bringing other data
 */
export type ReturnedInfo<T, ErrorKind extends BCE = CE, E = undefined> =
    | ReturnSuccess<T, ErrorKind>
    | ReturnFailure<E, ErrorKind>;

export interface ReturnFailure<K = undefined, ErrorKind extends BCE = CE>
    extends ReturnData<ErrorKind> {
    data: K;
    kind: Failure;
}

export interface ReturnSuccess<T, ErrorKind extends BCE = CE>
    extends ReturnData<ErrorKind> {
    data: T;
    kind: Success;
}

// Helper types to give these commonly used types shorter names
export type BCE = BlankCommandError;
export type CE = CommandError;

export interface LineRange {
    end: number;
    start: number;
}

export interface Ranged<T> {
    range: LineRange;
    value: T;
}

//#endregion
