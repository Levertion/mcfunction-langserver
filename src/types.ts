import { DataInterval, Interval, IntervalTree } from "node-interval-tree";
import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { BlankCommandError, CommandError } from "./brigadier_components/errors";
import { StringReader } from "./brigadier_components/string_reader";
import { Resources } from "./data/datapack_resources";
import { CommandNodePath, GlobalData } from "./data/types";

//#region Document
export interface FunctionInfo {
    lines: CommandLine[];
    /**
     * The filesystem path to the `datapacks` folder this is part of - NOT the folder of the single datapack
     */
    datapack_root: string;
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
}

export interface CommmandData {
    /**
     * Data from the datapacks
     */
    readonly localData?: Resources;
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

export interface ParseResult {
    contextKey: string;
    data: any;
}

export interface Parser {
    /**
     * Parse the argument as described in NodeProperties against this parser in the reader.
     * The context is optional for tests
     */
    parse: (reader: StringReader, properties: ParserInfo) => ReturnedInfo<ParseResult>;
    /**
     * List the suggestions at the end of the starting text described in `text`.
     * @returns an array of Suggestions, either strings or a Suggestion objection
     */
    getSuggestions: (text: string, context: ParserInfo) => SuggestResult[];
    /**
     * The kind of the suggestion in the Completion List
     */
    kind?: CompletionItemKind;
}
//#endregion
//#region ParsingData
export interface ParseNode extends Interval {
    path: CommandNodePath;
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
