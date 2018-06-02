import {
    convertToNamespace,
    namespacesEqual,
    ReturnHelper,
    stringifyNamespace
} from "..";
import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { StringReader } from "../../brigadier_components/string_reader";
import { DEFAULT_NAMESPACE } from "../../consts";
import { NamespacedName } from "../../data/types";
import { CE, ReturnedInfo } from "../../types";

const NAMESPACEEXCEPTIONS = {
    invalid_id: new CommandErrorBuilder(
        "argument.id.invalid",
        "Invalid character '%s' in location %s"
    )
};

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
    // Note that base namespace should not be undefined in any reasonable circumstances
    if (test.namespace === undefined) {
        return (
            (base.namespace === DEFAULT_NAMESPACE &&
                base.path.startsWith(test.path)) ||
            (!!base.namespace && base.namespace.startsWith(test.path))
        );
    } else {
        return (
            base.namespace === test.namespace && base.path.startsWith(test.path)
        );
    }
}

/**
 * Parse a namespace from a reader out of options
 * Returns the parsed namespace if parses correctly
 * doesn't add an error for non-option namespace
 */
export function parseNamespace(
    reader: StringReader,
    options: NamespacedName[],
    suggesting: boolean
): ReturnedInfo<NamespacedName, CE, NamespacedName | undefined> {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const text = readNamespaceText(reader);
    const namespace = convertToNamespace(text);
    const expr = /[^a-z0-9_.-]/g;
    let next: RegExpExecArray | null;
    let failed = false;
    do {
        next = expr.exec(namespace.path);
        if (next) {
            const i = text.indexOf(":") + 1 + next.index + start;
            failed = true;
            helper.addErrors(
                NAMESPACEEXCEPTIONS.invalid_id.create(i, i + 1, next[0], text)
            );
        }
    } while (next);
    if (failed) {
        return helper.fail();
    }
    let successful = false;
    for (const val of options) {
        if (namespacesEqual(val, namespace)) {
            successful = true;
        }
        if (suggesting && !reader.canRead() && namespaceStart(val, namespace)) {
            helper.addSuggestions({ start, text: stringifyNamespace(val) });
        }
    }
    if (successful) {
        return helper.succeed(namespace);
    } else {
        return helper.failWithData(namespace);
    }
}
