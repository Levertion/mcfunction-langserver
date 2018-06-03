export interface ContextPath<T> {
  data: T;
  path: string[];
}

export function resolvePaths<T>(
  paths: Array<ContextPath<T>>,
  argPath: string[]
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
