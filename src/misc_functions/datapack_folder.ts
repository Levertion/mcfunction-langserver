import * as path from "path";
import { WorkspaceFolder } from "vscode-languageserver/lib/main";
import { isChildOf } from "./third_party/child_dir";

interface DatapacksFolder {
    path: string;
    exact: boolean;
}

/**
 * Find the datapacks folder a file is in.
 * @param fileLocation The URI of the file
 * @param parent The URI to fall back on (such as the workspace root).
 * @param seperator The path seperator to use (allows for testing).
 */
export function calculateDataFolder(fileLocation: string, workspaces: WorkspaceFolder[],
    seperator: string = path.sep): DatapacksFolder {
    const packToSearch = seperator + "datapacks" + seperator;
    let packsFolderIndex = fileLocation.lastIndexOf(packToSearch);
    if (packsFolderIndex !== -1) {
        packsFolderIndex += packToSearch.length; // lastIndexOf returns the position of the start.
        return { path: fileLocation.substring(0, packsFolderIndex), exact: true };
    } else {
        for (const workspace of workspaces) {
            if (isChildOf(fileLocation, workspace.uri, seperator)) {
                return { path: workspace.uri, exact: false };
            }
        }
        return { path: "", exact: false };
    }
}
