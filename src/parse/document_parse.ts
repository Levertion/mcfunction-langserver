import { EventEmitter } from "events";
import { parseCommand } from ".";
import { DataManager } from "../data/manager";
import { FunctionInfo } from "../types";

export function parseLines(document: FunctionInfo, data: DataManager,
    emitter: EventEmitter, documentUri: string, lines: number[] = []) {
    if (lines.length === 0) {
        lines = document.lines.map((_, i) => i);
    }

    for (const lineNo of lines) {
        const line = document.lines[lineNo];
        const result = parseCommand(line.text, data.globalData, data.getPackFolderData(document.datapack_root));
        line.parseInfo = result;
        emitter.emit(`${documentUri}:${lineNo}`);
    }
}
