import { IConnection, WorkspaceFolder } from "vscode-languageserver/lib/main";
import { storeSecurity } from "../data/cache_management";
import { WorkspaceSecurity } from "../types";

/**
 * Check if the given change requires security confirmation
 */
export function securityIssues(settings: McFunctionSettings): string[] {
    const results: string[] = [];
    if (!!settings.data) {
        if (!!settings.data.customJar) {
            results.push("Custom Jar Path (mcfunction.data.customJar)");
        }
        if (!!settings.data.javaPath) {
            results.push("Custom java path (mcfunction.data.javaPath)");
        }
    }
    if (!!settings.parsers) {
        const names = Object.keys(settings.parsers);
        if (names.length > 0) {
            results.push(`Custom parsers for '${names.join()}'`);
        }
    }
    return results;
}

export function checkSecurity(folders: WorkspaceFolder[], security: WorkspaceSecurity,
    settings: McFunctionSettings): SecurityCheckResult | true {
    const issues = securityIssues(settings);
    if (issues.length === 0) {
        return true;
    }
    const empty: WorkspaceFolder[] = [];
    const stoppers: WorkspaceFolder[] = [];
    for (const folder of folders) {
        const value = security[folder.uri];
        if (value === false) {
            stoppers.push(folder);
        } else if (typeof value === "undefined") {
            empty.push(folder);
        }
    }
    return { issues, empty, stoppers };
}

interface SecurityCheckResult {
    issues: string[];
    empty: WorkspaceFolder[];
    stoppers: WorkspaceFolder[];
}

export async function actOnSecurity(result: SecurityCheckResult,
    connection: IConnection, security: WorkspaceSecurity): Promise<boolean> {
    let securityChanged = false;
    const resave = async () => {
        if (securityChanged) {
            await storeSecurity(security);
        }
    };
    if (result.stoppers.length > 0) {
        for (const stopper of result.stoppers) {
            const response = await connection.window.showErrorMessage(
                `[MCFUNCTION] You have insecure settings but earlier disallowed them for workspace ${stopper.name
                }. Reenable insecure settings for this workspace?`,
                { title: "Yes" }, { title: "No (Stops server)" });
            if (!!response && response.title === "Yes") {
                security[stopper.uri] = true;
                securityChanged = true;
            } else {
                await resave();
                return false;
            }
        }
    }
    if (result.empty.length > 0) {
        for (const empty of result.empty) {
            const response = await connection.window.showErrorMessage(
                `[MCFUNCTION] You have insecure settings but have not allowed them for workspace ${empty.name}`,
                { title: "Enable" }, { title: "Don't (Stops server)" });
            if (!!response && response.title === "Enable") {
                security[empty.uri] = true;
                securityChanged = true;
            } else {
                await resave();
                return false;
            }
        }
    }
    return true;
}
