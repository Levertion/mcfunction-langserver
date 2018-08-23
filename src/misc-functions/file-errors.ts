import { MiscInfo } from "../types";

export function createExtensionFileError(
    filePath: string,
    expected: string,
    actual: string
): MiscInfo {
    return {
        filePath,
        group: "extension",
        kind: "FileError",
        message: `File has incorrect extension: Expected ${expected}, got ${actual}.`
    };
}

export function createJSONFileError(filePath: string, error: any): MiscInfo {
    return {
        filePath,
        group: "json",
        kind: "FileError",
        message: `JSON parsing failed: '${error}'`
    };
}

export function createFileClear(filePath: string, group?: string): MiscInfo {
    return { kind: "ClearError", filePath, group };
}
