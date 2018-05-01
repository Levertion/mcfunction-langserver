import * as path from "path";

/**
 * Find the datapacks folder a file is in.
 * @param fileLocation The URI of the file
 * @param parent The URI to fall back on (such as the workspace root).
 * @param seperator The path seperator to use (allows for testing).
 */
export function calculateDataFolder(fileLocation: string, seperator: string = path.sep): string | undefined {
    const packToSearch = seperator + "datapacks" + seperator;
    let packsFolderIndex = fileLocation.lastIndexOf(packToSearch);
    if (packsFolderIndex !== -1) {
        packsFolderIndex += packToSearch.length; // lastIndexOf returns the position of the start.
        return fileLocation.substring(0, packsFolderIndex);
    } else {
        return;
    }
}
