import { DataInterval, Interval, IntervalTree } from "node-interval-tree";
import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { BlankCommandError, CommandError } from "./brigadier_components/errors";
import { StringReader } from "./brigadier_components/string_reader";
import { CommandNodePath, Datapack, GlobalData } from "./data/types";

//#region Document
export interface FunctionInfo {
    lines: CommandLine[];
    /**
     * The filesystem path to the `datapacks` folder this is part of - NOT the folder of the single datapack
     */
    datapack_root: string | undefined;
}

export interface WorkspaceSecurity {
    [workspace: string]: boolean;
}

export interface CommandLine {
    parseInfo?: StoredParseResult;
    text: string;
    /**
     * A cache of the tree of actions
     */
    actions?: IntervalTree<SubAction>;
}
//#endregion
//#region Interaction with parsers
export interface ParserInfo {
    node_properties: {
        [key: string]: any,
    };
    data: CommmandData;
    path: CommandNodePath;
    /**
     * The immutable context
     */
    context: CommandContext;
}

export interface CommmandData {
    /**
     * Data from datapacks
     */
    readonly localData?: Datapack[];
    readonly globalData: GlobalData;
}

export interface Suggestion {
    text: string;
    /**
     * The start from where value should be replaced. 0 indexed character gaps.
     * E.g. `@e[na` with the suggestion `{value:"name=",start:3}`
     * would make `@e[name=` when accepted.
     */
    start: number;
    kind?: CompletionItemKind;
    description?: string;
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
    isPlayer: boolean;
    [key: string]: any;
}

export interface Parser {
    /**
     * Parse the argument as described in NodeProperties against this parser in the reader.
     * Gets both suggestions and success
     */
    parse: (reader: StringReader, properties: ParserInfo) => ReturnedInfo<ContextChange> | undefined;
    /**
     * The default suggestion kind for suggestions from this parser
     */
    kind?: CompletionItemKind;
}

//#endregion
//#region ParsingData
export interface ParseNode extends Interval {
    path: CommandNodePath;
    context: CommandContext;
    final?: boolean;
}

export interface StoredParseResult {
    nodes: ParseNode[]; errors: CommandError[]; actions: SubAction[];
}

interface SubActionBase<U extends string, T> extends DataInterval<T> {
    type: U;
}

export type SubAction = SubActionBase<"hover", string>;
// | SubNode<"rename", RenameRequest>;
//#endregion
export type Success = true;
export const Success: Success = true;

export const Failure: Failure = false;
export type Failure = false;

//#region ReturnData
export interface ReturnData<ErrorKind extends BCE = CE> {
    errors: ErrorKind[];
    suggestions: SuggestResult[];
    actions: SubAction[];
}

/**
 * A general return type which can either succeed or fail, bringing other data
 */
export type ReturnedInfo<T, ErrorKind extends BCE = CE> = ReturnSuccess<T, ErrorKind> | ReturnFailure<ErrorKind>;

export interface ReturnFailure<ErrorKind extends BCE = CE> extends ReturnData<ErrorKind> {
    kind: Failure;
}

export interface ReturnSuccess<T, ErrorKind extends BCE = CE> extends ReturnData<ErrorKind> {
    kind: Success;
    data: T;
}
//#endregion
// Helper types to lower the amount of repetition of the names
export type BCE = BlankCommandError;
export type CE = CommandError;
