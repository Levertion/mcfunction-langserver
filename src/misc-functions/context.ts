import { CommandNodePath } from "../data/types";

export interface ContextPath<T> {
    data: T;
    path: CommandNodePath;
}

export function resolvePaths<T>(
    paths: Array<ContextPath<T>>,
    argPath: CommandNodePath
): T | undefined {
    for (const path of paths) {
        if (stringArrayEqual(argPath, path.path)) {
            return path.data;
        }
    }
    return undefined;
}

function stringArrayEqual(arr1: string[], arr2: string[]): boolean {
    return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
}

export function startPaths<T>(
    paths: Array<ContextPath<T>>,
    argpath: CommandNodePath
): T | undefined {
    let best: [number, T?] = [0, undefined];
    for (const option of paths) {
        if (
            option.path.length > best[0] &&
            option.path.length <= argpath.length &&
            argpath.every((v, i) => v === option.path[i])
        ) {
            best = [option.path.length, option.data];
        }
    }
    return best[1];
}
