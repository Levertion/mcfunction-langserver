export interface ContextPath<T> {
    path: string[];
    data: T;
}

export function resolvePaths<T>(paths: Array<ContextPath<T>>, argPath: string[]): T | undefined {
    for (const path of paths) {
        if (stringArrayEqual(argPath, path.path)) {
            return path.data;
        }
    }
    return undefined;
}

function stringArrayEqual(arr1: string[], arr2: string[]) {
    return arr1.length === arr2.length &&
        arr1.every(
            (v, i) => v === arr2[i],
        );
}
