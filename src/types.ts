import { DataInterval, Interval, IntervalTree } from "node-interval-tree";
import { CompletionItemKind } from "vscode-languageserver/lib/main";
import { CommandError } from "./brigadier_components/errors";
import { StringReader } from "./brigadier_components/string_reader";
import { Resources } from "./data/datapack_resources";
import { CommandNodePath, GlobalData } from "./data/types";

/**
 * A deeply readonly version of the given type.
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

/**
 * A Single Line in a Document.
 */
export interface CommandLine {
    /**
     * The information from parsing this line..
     */
    parseInfo?: ParsedInfo;
    /**
     * The text of this line.
     */
    text: string;
    /**
     * A cache of the tree of actions
     */
    actions?: IntervalTree<SubAction>;
}

export interface FunctionInfo {
    /**
     * The lines of this Function.
     */
    lines: CommandLine[];
    /**
     * The filesystem path to the `datapacks` folder this is part of.
     *
     * This is NOT the folder of the datapack
     */
    datapack_root: string;
}

/**
 * Information available to a parser, including information about the current node.
 */
export interface ParserInfo {
    node_properties: {
        [key: string]: any,
    };
    data: CommmandData;
    key: string;
}

export interface CommmandData {
    /**
     * The locally available data.
     */
    readonly localData?: Resources;
    /**
     * GlobalData accessable
     */
    readonly globalData: GlobalData;
}

export interface Suggestion {
    /**
     * The string to suggest.
     */
    value: string;
    /**
     * The start from where value should be replaced. 0 indexed character gaps.
     * E.g. `@e[na` with the suggestion `{value:"name=",start:3}`
     * would make `@e[name=` when accepted.
     */
    start: number;
    /**
     * The kind of the suggestion in the Completion List
     */
    kind?: CompletionItemKind;
    description?: string;
}

export type SuggestResult = Suggestion | string;

export interface Parser {
    /**
     * Parse the argument as described in NodeProperties against this parser in the reader.
     * The context is optional for tests
     */
    parse: (reader: StringReader, properties: ParserInfo) => ParseResult | void;
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

export interface ParseResult {
    /**
     * Whether or not parsing was successful.
     */
    successful: boolean;
    /**
     * The error is parsing was not successful.
     */
    errors?: CommandError[];
    actions?: SubAction[];
}

export interface ParseNode extends Interval {
    path: CommandNodePath;
    final?: boolean;
}

export interface ParsedInfo {
    nodes: ParseNode[]; errors: CommandError[]; actions: SubAction[];
}

interface SubNode<U extends string, T> extends DataInterval<T | (() => T)> {
    type: U;
}

export type SubAction = SubNode<"hover", string>;
 // | SubNode<"rename", RenameRequest>;
