import { CommandNode } from "../data/types";
import { CommandLine, CommmandData, ParserInfo } from "../types";

/**
 * Build parser info from the data required
 */
export function createParserInfo(node: CommandNode, data: CommmandData, key: string): ParserInfo {
    const result: ParserInfo = {
        data,
        key,
        node_properties: node.properties || {},
    };
    return result;
}

/**
 * Convert a string into CommandLines based on newline characters
 */
export function splitLines(text: string): CommandLine[] {
    return createCommandLines(text.split(/\r?\n/));
}

/**
 * Convert the given string array into a blank CommandLine Array
 */
export function createCommandLines(lines: string[]): CommandLine[] {
    const result: CommandLine[] = [];
    for (const line of lines) {
        result.push({ text: line });
    }
    return result;
}
