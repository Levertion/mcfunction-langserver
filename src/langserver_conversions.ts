import {
    Diagnostic, DiagnosticSeverity, DidChangeTextDocumentParams,
    Range,
} from "vscode-languageserver/lib/main";
import { CommandError } from "./brigadier_components/errors";
import { singleStringLineToCommandLines } from "./function_utils";
import { FunctionInfo } from "./types";

export function commandErrorToDiagnostic(error: CommandError, line: number): Diagnostic {
    const range: Range = { start: { line, character: error.range.start }, end: { line, character: error.range.end } };
    // Run Translation stuff on the error?
    return Diagnostic.create(range, "hello", error.severity || DiagnosticSeverity.Error, error.code, "mcfunction");
}
export function runChanges(changes: DidChangeTextDocumentParams, functionInfo: FunctionInfo): number[] {
    const changed: number[] = [];
    for (const change of changes.contentChanges) {
        if (!!change.range) { // Appease the compiler, as the change seems to have a
            const { start, end } = change.range;
            const newLineContent = functionInfo.lines[start.line].text.substring(0, start.character).concat(
                change.text, functionInfo.lines[end.line].text.substring(end.character));
            const difference = (end.line - start.line) + 1;
            const newLines = singleStringLineToCommandLines(newLineContent);
            functionInfo.lines.splice(start.line, difference,
                ...newLines);
            changed.forEach((v, i) => {
                if (v > start.line) {
                    changed[i] = v - difference + newLines.length;
                }
            });
            changed.push(...Array.from(new Array(newLines.length), (_, i) => {
                return start.line + i;
            }));
        }
    }
    const unique = changed.filter((value, index, self) => self.indexOf(value) === index);
    unique.sort((a, b) => a - b);
    return unique;
}
