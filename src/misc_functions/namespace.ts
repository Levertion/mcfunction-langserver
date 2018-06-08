import { ExactName, NamespacedName } from "../data/types";

export function exactifyNamespace(originalName: NamespacedName): ExactName {
    return { ...originalName, exact: true };
}

export function namespacesEqual(
    first: NamespacedName,
    second: NamespacedName
): boolean {
    return first.namespace === second.namespace && first.path === second.path;
}
