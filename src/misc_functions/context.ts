export interface ContextPath<T> {
    path: string[];
    data: (args: string[]) => T;
}

export function resolvePaths<T>(paths: Array<ContextPath<T>>, argPath: string[], args: string[]): T | undefined {
    for (const path of paths) {
        if (arreq(argPath, path.path)) {
            return path.data(args);
        }
    }
    return undefined;
}

function arreq(arr1: string[], arr2: string[]) {
    return arr1.length === arr2.length &&
        arr1.every(
            (v, i) => v === arr2[i],
        );
}
