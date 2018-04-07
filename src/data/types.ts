import { BlankCommandError, CommandError, fillBlankError } from "../brigadier_components/errors";
import { NamespaceData } from "./datapack_resources";

/**
 * Data which is useful no matter where the function is.
 */
export interface GlobalData {
    commands: CommandTree;
    resources: NamespaceData;
    meta_info: { version: string };
    blocks: BlocksPropertyInfo;
    items: string[];
}

//#region Command Tree
/**
 * The base Command Tree.
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
 */
export interface CommandNode extends MCNode<CommandNode> {
    /**
     * The Type of this node - whether it is a literal or an argument.
     */
    type: "literal" | "argument";
    /**
     * The parser for this node. Only Applicable if type of argument
     */
    parser?: string;
    /**
     * Whether this is a valid Command, which doesn't need completing.
     */
    executable?: boolean;
    /**
     * Where this node redirects to.
     */
    redirect?: CommandNodePath;
    /**
     * The properties of this node.
     */
    properties?: {
        [key: string]: any,
    };
}

/**
 * A node with Children.
 */
export interface MCNode<T> {
    children?: { [id: string]: T };
}
//#endregion Command Tree

//#region BlockInfo
/**
 * Information about the available blocks.
 *
 * The outer index signature is the block ID, including the namespace.
 *
 * The Inner Index Signature is property names, with a string array of valid values.
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

export interface ErrorableSubFunctionReturn<T> {
    result: T;
    errors: BlankCommandError[];
}

export function getErrors(ret: ErrorableSubFunctionReturn<any>, start: number, end: number): CommandError[] {
    const errors: CommandError[] = [];
    for (const err of ret.errors) {
        errors.push(fillBlankError(err, start, end));
    }
    return errors;
}
