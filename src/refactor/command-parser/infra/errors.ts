// Handles the central error store.
import { notStrictEqual, strictEqual } from "assert";
import { DiagnosticSeverity } from "vscode-languageserver";

export type ErrorID = number;

/**
 * Information about a single error
 */
export interface ErrorInfo {
    code: ErrorID;
    defaultText: string;
    severity?: DiagnosticSeverity;
}

const errors = new Map<ErrorID, ErrorInfo>();

/**
 * Register an error, and get its ID.
 * Breakdown of error codes:
 *  - 1000-1999: Generally applicable errors, e.g. Namespace parsing, etc.
 *  - 2000-9999: Parser specific errors. Each parser has an assigned block of 100 errors.
 *  - 10000 and above: Unused
 * @param code The stable code of the error.
 * @param defaultText The
 */
export function registerError(
    code: number,
    defaultText: string,
    severity?: DiagnosticSeverity
): ErrorID {
    strictEqual(
        errors.get(code),
        undefined,
        "Tried to create two errors with same code"
    );
    const data: ErrorInfo = {
        code,
        defaultText,
        severity
    };
    errors.set(code, data);
    return code;
}

export function getError(code: ErrorID): ErrorInfo {
    const error = errors.get(code);
    notStrictEqual(
        error,
        undefined,
        "Attempted to get an error which hadn't been previously defined"
    );
    return error as ErrorInfo;
}
