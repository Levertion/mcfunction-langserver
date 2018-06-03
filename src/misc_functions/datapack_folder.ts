import * as path from "path";

/**
 * Find the datapacks folder a file is in.
 * @param fileLocation The URI of the file
 * @param parent The URI to fall back on (such as the workspace root).
 * @param sep The path seperator to use (allows for testing).
 */
export function calculateDataFolder(
  fileLocation: string,
  sep: string = path.sep
): string | undefined {
  const packToSearch = `${sep}datapacks${sep}`;
  let packsFolderIndex = fileLocation.lastIndexOf(packToSearch);
  if (packsFolderIndex !== -1) {
    packsFolderIndex += packToSearch.length; // Note: lastIndexOf returns the position of the start.
    return fileLocation.substring(0, packsFolderIndex);
  } else {
    return undefined;
  }
}
