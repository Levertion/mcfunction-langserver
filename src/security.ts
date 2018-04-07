function requiresSecurityCheck(change: McFunctionSettings): string[] | false {
    const results: string[] = [];
    if (!!change.data) {
        if (!!change.data.customJar) {
            results.push("Custom Jar Path (mcfunction.data.customJar)");
        }
        if (!!change.data.javaPath) {
            results.push("Custom java path (mcfunction.data.javaPath)");
        }
    }
    if (results.length === 0) {
        return false;
    } else {
        return results;
    }
}
