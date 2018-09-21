import { DEFAULT_NAMESPACE, NAMESPACE } from "../consts";
import { NamespacedName } from "../data/types";

export function namespacesEqual(
    first: NamespacedName,
    second: NamespacedName
): boolean {
    return namesEqual(first, second) && first.path === second.path;
}

export function namesEqual(
    first: NamespacedName,
    second: NamespacedName
): boolean {
    return (
        first.namespace === second.namespace ||
        (isNamespaceDefault(first) && isNamespaceDefault(second))
    );
}

export function isNamespaceDefault(name: NamespacedName): boolean {
    return name.namespace === undefined || name.namespace === DEFAULT_NAMESPACE;
}

export function stringifyNamespace(namespace: NamespacedName): string {
    return (
        (namespace.namespace ? namespace.namespace : DEFAULT_NAMESPACE) +
        NAMESPACE +
        namespace.path
    );
}

export function convertToNamespace(
    input: string,
    splitChar: string = NAMESPACE
): NamespacedName {
    const index = input.indexOf(splitChar);
    if (index >= 0) {
        const pathContents = input.substring(
            index + splitChar.length,
            input.length
        );
        // Path contents should not have a : in the contents, however this is to be checked higher up.
        // This simplifies using the parsed result when parsing options

        // Related: https://bugs.mojang.com/browse/MC-91245 (Fixed)
        if (index >= 1) {
            return { namespace: input.substring(0, index), path: pathContents };
        } else {
            return { path: pathContents };
        }
    } else {
        return { path: input };
    }
}
