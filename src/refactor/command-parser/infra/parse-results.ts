import { notStrictEqual } from "assert";
import {
    CompletionItem,
    CompletionList,
    MarkupContent,
    MarkupKind
} from "vscode-languageserver";

import { LineRange } from "../../../types";

import { ErrorID } from "./errors";

export interface Suggestion extends Partial<CompletionItem> {
    // The markdown description for this suggestion
    description?: string | string[];
    label?: string;
}

/* /**
 * An acummulator for errors about files
 * /
export class MiscInfoStorer {}
 */
export interface ErrorData {
    code: ErrorID;
    range: LineRange;
    substitutions: string[];
}

export interface MergeOptions {
    // Actions?: boolean;
    errors?: boolean;
    suggestions?: boolean;
}

/**
 * An accumulator for the results of parsing. Subclass of Parser, but potentially more generally applicable.
 * TODO: Work out how to store file based errors
 */
export class ParseResults {
    public get erroring(): boolean {
        return this.errors === undefined;
    }

    public get suggesting(): boolean {
        return typeof this.suggestions !== "undefined";
    }

    // TODO: Use a more stable type to allow better testing.
    private errors: ErrorData[] | undefined;
    private suggestions: Map<number, Map<string, Suggestion>> | undefined;

    public addError(
        id: ErrorID,
        range: LineRange,
        ...substitutions: string[]
    ): void {
        if (this.errors) {
            this.errors.push({ code: id, range, substitutions });
        }
    }

    public addSuggestion(
        start: number,
        text: string,
        suggestion: Suggestion = {}
    ): void {
        if (this.suggestions) {
            let oldForIndex = this.suggestions.get(start);
            if (typeof oldForIndex === "undefined") {
                oldForIndex = new Map();
                this.suggestions.set(start, oldForIndex);
            }
            const oldValue = oldForIndex.get(text);
            if (oldValue) {
                mergeSuggestions(oldValue, suggestion);
            } else {
                oldForIndex.set(text, suggestion);
            }
        }
    }

    public call<F extends (self: this, ...args: any[]) => any>(
        func: F,
        settings: MergeOptions,
        ...rest: F extends (self: this, ...args: infer A) => any ? A : never
    ): ReturnType<F> {
        const errors = this.errors;
        const suggestions = this.suggestions;
        if (settings.errors === false) {
            this.errors = undefined;
        }
        if (settings.suggestions === false) {
            this.suggestions = undefined;
        }
        const result = func(this, ...rest);
        this.errors = errors;
        this.suggestions = suggestions;
        return result;
    }

    public callMethod<F extends (this: this, ...args: any[]) => any>(
        func: F,
        settings: MergeOptions,
        ...rest: F extends (this: this, ...args: infer A) => any ? A : never
    ): ReturnType<F> {
        const errors = this.errors;
        const suggestions = this.suggestions;
        if (settings.errors === false) {
            this.errors = undefined;
        }
        if (settings.suggestions === false) {
            this.suggestions = undefined;
        }
        const result = func.bind(this)(...rest);
        this.errors = errors;
        this.suggestions = suggestions;
        return result;
    }
    /**
     * Create a `CompletionList` from the stored suggestions.
     *
     * TODO: Consider moving this from the command-parser package into the server package
     * @param line The line number in the document the completions should be created for
     * @param end The position in the line of the users cursor
     */
    public createCompletionList(line: number, end: number): CompletionList {
        if (this.suggestions) {
            const result: CompletionItem[] = [];
            for (const [character, texts] of this.suggestions) {
                for (const [newText, suggestion] of texts) {
                    const documentation:
                        | MarkupContent
                        | undefined = suggestion.description
                        ? {
                              kind: MarkupKind.Markdown,
                              value: Array.isArray(suggestion.description)
                                  ? suggestion.description.join("\n\n---\n")
                                  : suggestion.description
                          }
                        : undefined;
                    result.push({
                        ...suggestion,
                        documentation,
                        label: suggestion.label || newText,
                        textEdit: {
                            newText,
                            range: {
                                end: { line, character: end },
                                start: { line, character }
                            }
                        }
                    });
                }
            }
            return CompletionList.create(result, false);
        } else {
            throw new Error(
                "Attempted to create a CompletionList when suggestions are not enabled"
            );
        }
    }

    public disableErrors(): ParseResults["errors"] {
        const val = this.errors;
        this.suggestions = undefined;
        return val;
    }

    public disableSuggestions(): ParseResults["suggestions"] {
        const val = this.suggestions;
        this.suggestions = undefined;
        return val;
    }

    public enableErrors(value: ParseResults["errors"] = []): void {
        this.errors = value;
    }

    public enableSuggestions(
        value: ParseResults["suggestions"] = new Map()
    ): void {
        this.suggestions = value;
    }

    public getErrors(): ErrorData[] {
        notStrictEqual(
            this.errors,
            undefined,
            "Attempted to get errors when errors are not enabled"
        );
        return this.errors as ErrorData[];
    }
}

function mergeSuggestions(first: Suggestion, newer: Suggestion): void {
    if (first.description) {
        if (typeof newer.description !== "undefined") {
            if (typeof first.description === "string") {
                if (typeof newer.description === "string") {
                    first.description = [first.description, newer.description];
                } else {
                    first.description = [
                        first.description,
                        ...newer.description
                    ];
                }
            } else {
                if (typeof newer.description === "string") {
                    first.description.push(newer.description);
                } else {
                    first.description.push(...newer.description);
                }
            }
        }
    } else {
        first.description = newer.description;
    }
}
