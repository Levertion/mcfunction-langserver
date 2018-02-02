import { DiagnosticSeverity } from "vscode-languageserver/lib/main";
import { MCFormat } from "../function_utils";

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
    severity: DiagnosticSeverity;
}

export class CommandErrorBuilder {
    private code: string;
    private default: string;
    private severity: DiagnosticSeverity;

    constructor(code: string, explanation: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error) {
        this.code = code;
        this.default = explanation;
        this.severity = severity;
    }

    public create(start: number, end: number, ...substitutions: string[]): CommandError {
        const diagnosis: CommandError = {
            code: this.code,
            range: { start, end },
            severity: this.severity, substitutions,
            text: MCFormat(this.default, ...substitutions),
        };
        return diagnosis;
    }
}
