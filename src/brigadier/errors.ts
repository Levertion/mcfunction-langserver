import { DiagnosticSeverity } from "vscode-languageserver/lib/main";
import { MCFormat } from "../misc-functions";
import { LineRange } from "../types";

/**
 * A blank command error
 */
export interface BlankCommandError {
    /**
     * The code of this error, usable for translation?
     */
    code: string;
    /**
     * The severity of this error.
     */
    severity: DiagnosticSeverity;
    /**
     * The substitutions to insert into the error text.
     */
    substitutions?: string[];
    /**
     * The cached text of this error.
     */
    text: string;
}

/**
 * An error inside a command.
 */
export interface CommandError extends BlankCommandError {
    /**
     * The range of this error.
     */
    range: LineRange;
}

/**
 * Helper class to create command errors
 */
export class CommandErrorBuilder {
    private readonly code: string;
    private readonly default: string;
    private readonly severity: DiagnosticSeverity;

    public constructor(
        code: string,
        explanation: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error
    ) {
        this.code = code;
        this.default = explanation;
        this.severity = severity;
    }

    public create(
        start: number,
        end: number,
        ...substitutions: string[]
    ): CommandError {
        const diagnosis: CommandError = Object.assign(
            this.createBlank(...substitutions),
            { range: { start, end } }
        );
        return diagnosis;
    }

    public createBlank(...substitutions: string[]): BlankCommandError {
        return {
            code: this.code,
            severity: this.severity,
            substitutions,
            text: MCFormat(this.default, ...substitutions)
        };
    }
}

/**
 * Transform `err` into a real command error.
 * MODIFIES `err`
 * @param err The error to transform
 * @param start The starting location in the line of the error
 * @param end The end position
 */
export function fillBlankError(
    err: BlankCommandError,
    start: number,
    end: number
): CommandError {
    return { ...err, range: { start, end } };
}
