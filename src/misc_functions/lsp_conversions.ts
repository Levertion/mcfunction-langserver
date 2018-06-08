import {
    Diagnostic,
    DidChangeTextDocumentParams,
    Range
} from "vscode-languageserver";
import { CommandError } from "../brigadier_components/errors";
import { FunctionInfo } from "../types";
import { splitLines } from "./creators";
import { shouldTranslate } from "./translation";

/**
 * Turn a command error into a language server diagnostic
 */
export function commandErrorToDiagnostic(
    error: CommandError,
    line: number
): Diagnostic {
    const range: Range = {
        end: { line, character: error.range.end },
        start: { line, character: error.range.start }
    };
    // Run Translation stuff on the error?
    const text = shouldTranslate()
        ? `'${error.text}': Translation is not yet supported` // Translate(error.code)
        : error.text;
    return Diagnostic.create(
        range,
        text,
        error.severity,
        error.code,
        "mcfunction"
    );
}

export function runChanges(
    changes: DidChangeTextDocumentParams,
    functionInfo: FunctionInfo
): number[] {
    const changed: number[] = [];
    for (const change of changes.contentChanges) {
        if (!!change.range) {
            // Appease the compiler, as the change interface seems to have range optional
            const { start, end }: Range = change.range;
            const newLineContent = functionInfo.lines[start.line].text
                .substring(0, start.character)
                .concat(
                    change.text,
                    functionInfo.lines[end.line].text.substring(end.character)
                );
            const difference = end.line - start.line + 1;
            const newLines = splitLines(newLineContent);
            functionInfo.lines.splice(start.line, difference, ...newLines);
            changed.forEach((v, i) => {
                if (v > start.line) {
                    changed[i] = v - difference + newLines.length;
                }
            });
            changed.push(
                ...Array.from(
                    new Array(newLines.length),
                    (_, i) => start.line + i
                )
            );
        }
    }
    const unique = changed.filter(
        (value, index, self) => self.indexOf(value) === index
    );
    unique.sort((a, b) => a - b);
    return unique;
}
