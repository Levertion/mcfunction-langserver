import { MemoryFS } from "../parsers/minecraft/nbt/doc_fs";

/**
 * Types for data
 */
//#region Namespace
export interface NamespacedName {
    namespace?: string;
    path: string;
}

//#endregion
export interface GlobalData {
    blocks: BlocksPropertyInfo;
    commands: CommandTree;
    items: string[];
    meta_info: { version: string };
    nbt_docs: MemoryFS;
    resources: Resources;
}

export type Cacheable = Pick<
    GlobalData,
    "commands" | "blocks" | "items" | "meta_info" | "resources"
>;

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

export interface PacksInfo {
    location: string;
    packnamesmap: { [name: string]: DataPackID };
    packs: { [packID: number]: Datapack };
}

export interface LocalData extends PacksInfo {
    current: DataPackID;
}

export interface MinecraftResource extends NamespacedName {
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
    advancements?: MinecraftResource[];
    block_tags?: MinecraftResource[];
    function_tags?: MinecraftResource[];
    functions?: MinecraftResource[];
    item_tags?: MinecraftResource[];
    loot_tables?: MinecraftResource[];
    recipes?: MinecraftResource[];
    structures?: MinecraftResource[];
}

export interface DataResource<T> extends MinecraftResource {
    data?: T;
}

//#region Resource file description
export interface Tag {
    replace?: boolean;
    values: string[];
}
//#endregion
//#endregion
