import { IConnection } from "vscode-languageserver";
import { storeSecurity } from "../data/cache_management";
import { WorkspaceSecurity } from "../types";

/**
 * Check if the given change requires security confirmation
 */
export function securityIssues(
    settings: McFunctionSettings,
    security: WorkspaceSecurity
): Array<keyof WorkspaceSecurity> {
    const results: Array<keyof WorkspaceSecurity> = [];
    if (!!settings.data) {
        if (!!settings.data.customJar && security.JarPath !== true) {
            results.push("JarPath");
        }
        if (!!settings.data.javaPath && security.JavaPath !== true) {
            results.push("JavaPath");
        }
    }
    if (!!settings.parsers && security.CustomParsers !== true) {
        const names = Object.keys(settings.parsers);
        if (names.length > 0) {
            results.push("CustomParsers");
        }
    }
    return results;
}

export async function actOnSecurity(
    issues: Array<keyof WorkspaceSecurity>,
    connection: IConnection,
    security: WorkspaceSecurity
): Promise<boolean> {
    let securityChanged = false;
    const resave = async () => {
        if (securityChanged) {
            await storeSecurity(security);
        }
    };
    for (const issue of issues) {
        const response = await Promise.resolve(
            connection.window.showErrorMessage(
                `[MCFUNCTION] You have the potentially insecure setting '${issue}' set, but no confirmation has been recieved.`,
                { title: "Yes" },
                { title: "No (Stops server)" }
            )
        );
        if (!!response && response.title === "Yes") {
            security[issue] = true;
            securityChanged = true;
        } else {
            return false;
        }
    }
    await resave();
    return true;
}
