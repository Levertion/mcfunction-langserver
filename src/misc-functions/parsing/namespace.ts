import { CompletionItemKind } from "vscode-languageserver/lib/main";
import {
    convertToNamespace,
    namespacesEqual,
    ReturnHelper,
    stringifyNamespace
} from "..";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { NamespacedName } from "../../data/types";
import { CE, ReturnedInfo, ReturnSuccess, Suggestion } from "../../types";
import { isNamespaceDefault, namesEqual } from "../namespace";

const NAMESPACEEXCEPTIONS = {
    invalid_id: new CommandErrorBuilder(
        "argument.id.invalid",
        "Invalid character '%s' in location %s"
    )
};

const disallowedPath = /[^0-9a-z_/\.-]/g;

export function readNamespaceText(reader: StringReader): string {
    const namespaceChars = /^[0-9a-z_:/\.-]$/;
    return reader.readWhileRegexp(namespaceChars);
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
    return namespaceSuggestions(
        // tslint:disable-next-line:no-unnecessary-callback-wrapper this is a false positive - see https://github.com/palantir/tslint/issues/2430
        options.map(v => convertToNamespace(v)),
        value,
        start
    );
}

export function parseNamespace(
    reader: StringReader
): ReturnedInfo<NamespacedName> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const text = readNamespaceText(reader);
    const namespace = convertToNamespace(text);
    let next: RegExpExecArray | null;
    let failed = false;
    // Give an error for each invalid character
    do {
        next = disallowedPath.exec(namespace.path);
        if (next) {
            // Relies on the fact that convertToNamespace splits on the first
            const i = text.indexOf(":") + 1 + next.index + start;
            failed = true;
            helper.addErrors(
                NAMESPACEEXCEPTIONS.invalid_id.create(i, i + 1, next[0], text)
            );
        }
    } while (next);
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
    completionKind?: CompletionItemKind
): ReturnedInfo<OptionResult<T>, CE, NamespacedName | undefined> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const namespace = parseNamespace(reader);
    if (helper.merge(namespace)) {
        const results = processParsedNamespaceOption(
            namespace.data,
            options,
            !reader.canRead(),
            start,
            completionKind
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
    completionKind?: CompletionItemKind
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
                stringifyNamespace(val),
                completionKind
            );
        }
    }
    return helper.succeed(results);
}
