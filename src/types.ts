import { DataInterval, Interval, IntervalTree } from "node-interval-tree";
import { CompletionItemKind } from "vscode-languageserver";
import { BlankCommandError, CommandError } from "./brigadier_components/errors";
import { StringReader } from "./brigadier_components/string_reader";
import { CommandNodePath, Datapack, GlobalData } from "./data/types";

//#region Document
export interface FunctionInfo {
    /**
     * The filesystem path to the `datapacks` folder this is part of - NOT the folder of the single datapack
     */
    datapack_root: string | undefined;
    lines: CommandLine[];
}

export interface WorkspaceSecurity {
    CustomParsers?: boolean;
    JarPath?: boolean;
    JavaPath?: boolean;
}

export interface CommandLine {
    /**
     * A cache of the tree of actions
     */
    actions?: IntervalTree<SubAction>;
    parseInfo?: StoredParseResult | false;
    text: string;
}
//#endregion
//#region Interaction with parsers
export interface ParserInfo {
    /**
     * The immutable context
     */
    context: CommandContext;
    data: CommmandData;
    node_properties: Dictionary<any>;
    path: CommandNodePath; // Length can safely be assumed to be greater than 0
    /**
     * When suggesting, the end of the reader's string will be the cursor position
     */
    suggesting: boolean;
}

export interface CommmandData {
    readonly globalData: GlobalData;
    /**
     * Data from datapacks
     */
    readonly localData?: Datapack[];
}

export interface Suggestion {
    description?: string;
    kind?: CompletionItemKind;
    /**
     * The start from where value should be replaced. 0 indexed character gaps.
     * E.g. `@e[na` with the suggestion `{value:"name=",start:3}`
     * would make `@e[name=` when accepted.
     */
    start: number;
    text: string;
}

export type SuggestResult = Suggestion | string;

/**
 * A change to the shared context
 */
export type ContextChange = Partial<CommandContext> | undefined;

export interface CommandContext {
    /**
     * Whether the executor is definitely a player
     */
    isPlayer?: boolean;
    [key: string]: any;
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

//#endregion
//#region ParsingData
export interface ParseNode extends Interval {
    context: CommandContext;
    final: boolean;
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
export type SubAction =
    | SubActionBase<"format", string>
    | SubActionBase<"highlight", string[]>
    | SubActionBase<"hover", string>;
// | SubActionBase<"rename", RenameRequest>;
//#endregion
export type Success = true;
export const success: Success = true;

export const failure: Failure = false;
export type Failure = false;

//#region ReturnData
export interface ReturnData<ErrorKind extends BCE = CE> {
    actions: SubAction[];
    errors: ErrorKind[];
    suggestions: SuggestResult[];
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
//#endregion
// Helper types to lower the amount of repetition of the names
export type BCE = BlankCommandError;
export type CE = CommandError;

export interface HighlightScope {
    end: number;
    scopes: string[];
    start: number;
}
