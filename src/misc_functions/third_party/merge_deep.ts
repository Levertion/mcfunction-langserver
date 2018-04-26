/**
 * merge_deep function adapted from:
 *
 * https://stackoverflow.com/a/34749873/8728461
 *
 * Originally, non-typescript code by: https://github.com/salakar
 */

interface AnyObject { // Added to appease no implicit any
    [key: string]: any;
}
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): item is AnyObject {
    return (item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 */
export function mergeDeep(target: AnyObject, ...sources: AnyObject[]): AnyObject {
    if (!sources.length) { return target; }
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) { Object.assign(target, { [key]: {} }); }
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
