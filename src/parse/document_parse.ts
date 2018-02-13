import { parseCommand } from ".";
import { DataManager } from "../data/manager";
import { FunctionInfo } from "../types";

export function parseLines(document: FunctionInfo, data: DataManager, lines: number[] = []) {
    if (lines.length === 0) {
        lines = document.lines.map((_, i) => i);
    }

    for (const lineNo of lines) {
        const line = document.lines[lineNo];
        const result = parseCommand(line.text, data.globalData, data.packData);
        line.parseInfo = result;
    }
}
