import { CompletionItemKind } from "vscode-languageserver/lib/main";

import {
    convertToNamespace,
    namespacesEqual,
    ReturnHelper,
    stringifyNamespace
} from "..";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { NAMESPACE } from "../../consts";
import { ID } from "../../data/types";
import { CE, ReturnedInfo, ReturnSuccess, Suggestion } from "../../types";

const NAMESPACEEXCEPTIONS = {
    invalid_id: new CommandErrorBuilder(
        "argument.id.invalid",
        "The seperator '%s' should not be repeated in the ID '%s'"
    )
};

export const namespaceChars = /^[0-9a-z_:/\.-]$/;
const allowedInSections = /^[0-9a-z_/\.-]$/;

export function stringArrayToNamespaces(strings: string[]): ID[] {
    // tslint:disable-next-line:no-unnecessary-callback-wrapper this is a false positive - see https://github.com/palantir/tslint/issues/2430
    return strings.map(v => convertToNamespace(v));
}

export function readNamespaceText(
    reader: StringReader,
    seperator: string = NAMESPACE,
    stopAfterFirst: boolean = false
): string {
    let found = false;
    return reader.readWhileFunction(c => {
        if (c === seperator) {
            if (found && stopAfterFirst) {
                return false;
            }
            found = true;
            return true;
        }
        return allowedInSections.test(c);
    });
}

export function namespaceSuggestions(
    options: ID[],
    start: number
): Suggestion[] {
    const result: Suggestion[] = [];
    for (const option of options) {
        result.push({ text: stringifyNamespace(option), start });
    }
    return result;
}

export function namespaceSuggestionString(
    options: string[],
    start: number
): Suggestion[] {
    return namespaceSuggestions(stringArrayToNamespaces(options), start);
}

export function parseNamespace(
    reader: StringReader,
    seperator: string = NAMESPACE,
    stopAfterFirst: boolean = false
): ReturnedInfo<ID> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const text = readNamespaceText(reader, seperator, stopAfterFirst);
    const namespace = convertToNamespace(text, seperator);
    let next = 0;
    let failed = false;
    // Give an error for each invalid character
    while (true) {
        next = namespace.path.indexOf(seperator, next + 1);
        if (next !== -1) {
            const i = text.indexOf(seperator) + 1 + next + start;
            failed = true;
            helper.addErrors(
                NAMESPACEEXCEPTIONS.invalid_id.create(
                    i,
                    i + seperator.length,
                    seperator,
                    text
                )
            );
        } else {
            break;
        }
    }
    if (failed) {
        return helper.fail();
    } else {
        return helper.succeed(namespace);
    }
}

interface OptionResult<T> {
    literal: ID;
    values: T[];
}

export function parseNamespaceOption<T extends ID>(
    reader: StringReader,
    options: T[],
    completionKind?: CompletionItemKind,
    seperator: string = NAMESPACE,
    stopAfterFirst: boolean = false
): ReturnedInfo<OptionResult<T>, CE, ID | undefined> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const namespace = parseNamespace(reader, seperator, stopAfterFirst);
    if (helper.merge(namespace)) {
        const results = processParsedNamespaceOption(
            namespace.data,
            options,
            !reader.canRead(),
            start,
            completionKind,
            seperator
        );
        helper.merge(results);
        if (results.data.length > 0) {
            return helper.succeed<OptionResult<T>>({
                literal: namespace.data,
                values: results.data
            });
        } else {
            return helper.failWithData(namespace.data);
        }
    } else {
        return helper.failWithData(undefined);
    }
}

export function processParsedNamespaceOption<T extends ID>(
    namespace: ID,
    options: T[],
    suggest: boolean,
    start: number,
    completionKind?: CompletionItemKind,
    seperator: string = NAMESPACE
): ReturnSuccess<T[]> {
    const results: T[] = [];
    const helper = new ReturnHelper();
    for (const val of options) {
        if (namespacesEqual(val, namespace)) {
            results.push(val);
        }
        if (suggest) {
            helper.addSuggestion(
                start,
                stringifyNamespace(val, seperator),
                completionKind
            );
        }
    }
    return helper.succeed(results);
}
