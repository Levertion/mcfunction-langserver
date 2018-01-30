import { DiagnosticSeverity } from "vscode-languageserver/lib/main";

/**
 * An error inside a command.
 */
export interface CommandError {
    /**
     * The code of this error, usable for translation?
     */
    code: string;
    /**
     * The substitutions to insert into the error.
     */
    substitutions?: string[];
    /**
     * The cached text of this error.
     */
    text: string;
    /**
     * The range of this error.
     */
    range: {
        start: number,
        end: number,
    };
    /**
     * The severity of this error.
     */
    severity?: DiagnosticSeverity;
}
