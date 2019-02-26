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
import { NamespacedName } from "../../data/types";
import { CE, ReturnedInfo, ReturnSuccess, Suggestion } from "../../types";
import { isNamespaceDefault, namesEqual } from "../namespace";

const NAMESPACEEXCEPTIONS = {
    invalid_id: new CommandErrorBuilder(
        "argument.id.invalid",
        "The seperator '%s' should not be repeated in the ID '%s'"
    )
};

export const namespaceChars = /^[0-9a-z_:/\.-]$/;
const allowedInSections = /^[0-9a-z_/\.-]$/;

export function stringArrayToNamespaces(strings: string[]): NamespacedName[] {
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

/**
 * Does `base`(eg minecraft:stone) start with `test` (e.g. sto) [Y]
 */
export function namespaceStart(
    base: NamespacedName,
    test: NamespacedName
): boolean {
    if (test.namespace === undefined) {
        return (
            (isNamespaceDefault(base) && base.path.startsWith(test.path)) ||
            (!!base.namespace && base.namespace.startsWith(test.path))
        );
    } else {
        return namesEqual(base, test) && base.path.startsWith(test.path);
    }
}

export function namespaceSuggestions(
    options: NamespacedName[],
    value: NamespacedName,
    start: number
): Suggestion[] {
    const result: Suggestion[] = [];
    for (const option of options) {
        if (namespaceStart(option, value)) {
            result.push({ text: stringifyNamespace(option), start });
        }
    }
    return result;
}

export function namespaceSuggestionString(
    options: string[],
    value: NamespacedName,
    start: number
): Suggestion[] {
    return namespaceSuggestions(stringArrayToNamespaces(options), value, start);
}

export function parseNamespace(
    reader: StringReader,
    seperator: string = NAMESPACE,
    stopAfterFirst: boolean = false
): ReturnedInfo<NamespacedName> {
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
    literal: NamespacedName;
    values: T[];
}

export function parseNamespaceOption<T extends NamespacedName>(
    reader: StringReader,
    options: T[],
    completionKind?: CompletionItemKind,
    seperator: string = NAMESPACE,
    stopAfterFirst: boolean = false
): ReturnedInfo<OptionResult<T>, CE, NamespacedName | undefined> {
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

export function processParsedNamespaceOption<T extends NamespacedName>(
    namespace: NamespacedName,
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
        if (suggest && namespaceStart(val, namespace)) {
            helper.addSuggestion(
                start,
                stringifyNamespace(val, seperator),
                completionKind
            );
        }
    }
    return helper.succeed(results);
}
