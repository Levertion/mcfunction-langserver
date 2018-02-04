import * as path from "path";
import { format } from "util";
import { CommandLine } from "./types";

/**
 * Find the datapacks folder a file is in.
 * @param fileLocation The URI of the file
 * @param fallback The URI to fall back on (such as the workspace root).
 * @param seperator The path seperator to use (allows for testing).
 */
export function calculateDataFolder(fileLocation: string, fallback: string,
    seperator: string = path.sep): { folder: string, fallback: boolean } {
    const packToSearch = seperator + "datapacks" + seperator;
    let packsFolderIndex = fileLocation.lastIndexOf(packToSearch);
    if (packsFolderIndex !== -1) {
        packsFolderIndex += packToSearch.length; // lastIndexOf returns the position of the start.
        return { folder: fileLocation.substring(0, packsFolderIndex), fallback: false };
    } else {
        return { folder: fallback, fallback: true };
    }
}
/**
 * Convert a string into CommandLines. If there are any newline characters,
 * they split into a new CommandLine
 * @param text The line (or lines) to convert
 */
export function singleStringLineToCommandLines(text: string): CommandLine[] {
    return stringsToCommandLine(text.split(/\r?\n/));
}

/**
 * Convert the given string array into a blank CommandLine Array
 * @param lines The string[] of lines to convert
 */
export function stringsToCommandLine(lines: string[]): CommandLine[] {
    const result: CommandLine[] = [];
    for (const line of lines) {
        result.push({ text: line });
    }
    return result;
}

export function shouldTranslate(): boolean {
    return mcLangSettings.translation.enabled === true && mcLangSettings.translation.lang.toLowerCase() !== "en-us";
}
export function MCFormat(base: string, ...substitutions: string[]): string {
    return format(base, substitutions);
    // TODO, make more like Minecraft's substitutions.
    // Either to implement in-house or using package such as
    // https://www.npmjs.com/package/printf
}
