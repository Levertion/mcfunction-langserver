/**
 * Check if the given change requires security confirmation
 */
export function requiresSecurityCheck(change: McFunctionSettings): string[] | false {
    const results: string[] = [];
    if (!!change.data) {
        if (!!change.data.customJar) {
            results.push("Custom Jar Path (mcfunction.data.customJar)");
        }
        if (!!change.data.javaPath) {
            results.push("Custom java path (mcfunction.data.javaPath)");
        }
    }
    if (!!change.parsers) {
        const names = Object.keys(change.parsers);
        if (names.length > 0) {
            results.push(`Custom parsers for '${names.join()}'`);
        }
    }
    if (results.length === 0) {
        return false;
    } else {
        return results;
    }
}
