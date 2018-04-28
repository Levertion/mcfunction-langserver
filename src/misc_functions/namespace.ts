import { ExactName, NamespacedName } from "../data/types";

export function exactifyNamespace(originalName: NamespacedName): ExactName {
    return Object.assign(originalName, { exact: true });
}
