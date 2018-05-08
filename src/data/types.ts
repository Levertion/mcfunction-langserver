/**
 * Types for data
 */
//#region Namespace
export interface NamespacedName {
    namespace: string;
    path: string;
}

export interface ExactName extends NamespacedName {
    /**
     * Whether the namespace was explicitly specified
     */
    exact: boolean;
}
//#endregion
export interface GlobalData {
    blocks: BlocksPropertyInfo;
    commands: CommandTree;
    resources: NamespaceData;
    items: string[];
    meta_info: { version: string };
}

//#region Command Tree
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
    type: "literal" | "argument";
    /**
     * The parser for this node. Only Applicable if type of argument
     */
    parser?: string;
    executable?: boolean;
    redirect?: CommandNodePath;
    properties?: Dictionary<any>;
}

/**
 * A node with children.
 */
export interface MCNode<T> {
    children?: { [id: string]: T };
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
    namespaces: {
        [name: string]: NamespaceData;
    };
    path: string;
}

export interface NamespaceData {
    functions?: MinecraftResource[];
    recipes?: MinecraftResource[];
    advancements?: MinecraftResource[];
    loot_tables?: MinecraftResource[];
    structures?: MinecraftResource[];
    block_tags?: MinecraftResource[];
    item_tags?: MinecraftResource[];
    function_tags?: MinecraftResource[];
}

export interface DataResource<T> extends MinecraftResource {
    data?: T;
}

export interface MinecraftResource {
    resource_name: NamespacedName;
}

//#region Resource file description
export interface Tag {
    replace?: boolean;
    values: string[];
}
//#endregion
//#endregion
