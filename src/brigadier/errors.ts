import { DiagnosticSeverity } from "vscode-languageserver/lib/main";
import { MCFormat } from "../misc-functions";

/**
 * A blank command error
 */
export interface BlankCommandError {
    /**
     * Signifies that the error is a command error.
     */
    _e: "1";
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
    range: {
        end: number;
        start: number;
    };
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
        ...substitutions: any[]
    ): CommandError {
        const diagnosis: CommandError = Object.assign(
            this.createBlank(...substitutions),
            { range: { start, end } }
        );
        return diagnosis;
    }

    public createBlank(...substitutions: any[]): BlankCommandError {
        return {
            _e: "1",
            code: this.code,
            severity: this.severity,
            substitutions,
            text: MCFormat(this.default, ...substitutions)
        };
    }
}

/**
 * Test if `T` is a command error
 * @param T The thing to test
 */
export function isCommandError(T: any): T is CommandError {
    return T._e === "1";
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
