import { DEFAULT_NAMESPACE, NAMESPACE } from "../consts";
import { ID } from "../data/types";

export function idsEqual(first: ID, second: ID): boolean {
    return namespacesEqual(first, second) && first.path === second.path;
}

export function namespacesEqual(first: ID, second: ID): boolean {
    return (
        first.namespace === second.namespace ||
        (isNamespaceDefault(first) && isNamespaceDefault(second))
    );
}

export function isNamespaceDefault(name: ID): boolean {
    return name.namespace === undefined || name.namespace === DEFAULT_NAMESPACE;
}

export function stringifyID(
    namespace: ID,
    seperator: string = NAMESPACE
): string {
    return (
        (namespace.namespace ? namespace.namespace : DEFAULT_NAMESPACE) +
        seperator +
        namespace.path
    );
}

/**
 * Convert a string into an `ID`. This should only be called directly on strings which are known to be valid
 * The behaviour on invalid strings is to leave the second seperator in the path
 */
export function convertToID(input: string, splitChar: string = NAMESPACE): ID {
    const index = input.indexOf(splitChar);
    if (index >= 0) {
        const pathContents = input.substring(
            index + splitChar.length,
            input.length
        );
        // Path contents should not have a : in the contents, however this is to be checked higher up.
        // This simplifies using the parsed result when parsing known statics
        if (index >= 1) {
            return { namespace: input.substring(0, index), path: pathContents };
        } else {
            return { path: pathContents };
        }
    } else {
        return { path: input };
    }
}

export function stringArrayToIDs(strings: string[]): ID[] {
    // tslint:disable-next-line:no-unnecessary-callback-wrapper this is a false positive - see https://github.com/palantir/tslint/issues/2430
    return strings.map(v => convertToID(v));
}
