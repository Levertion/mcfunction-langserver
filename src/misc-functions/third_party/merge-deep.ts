/**
 * merge_deep function adapted from:
 *
 * https://stackoverflow.com/a/34749873/8728461
 *
 * Originally, non-typescript code by: https://github.com/salakar
 */

type AnyDict = Dictionary<any>;

/**
 * Simple object check.
 * @param item the item
 */
export function isObject(item: any): item is AnyDict {
    return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 *
 * @todo: Stop using this and just use workspace/configuration request
 */
export function mergeDeep(target: AnyDict, ...sources: AnyDict[]): AnyDict {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
