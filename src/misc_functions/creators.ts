import { CommandNode, CommandNodePath } from "../data/types";
import {
  CommandContext,
  CommandLine,
  CommmandData,
  ParserInfo
} from "../types";

/**
 * Build parser info from the data required
 */
export function createParserInfo(
  node: CommandNode,
  data: CommmandData,
  path: CommandNodePath,
  context: CommandContext,
  suggesting: boolean
): ParserInfo {
  const result: ParserInfo = {
    context,
    data,
    node_properties: node.properties || {},
    path,
    suggesting
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
