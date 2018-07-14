import * as path from "path";
import { walkDir } from "../misc_functions/promisified_fs";
import { MemoryFS } from "../parsers/minecraft/nbt/doc_fs";
import { NonCacheable } from "./types";

export const rootNodePath = require.resolve("mc-nbt-paths/root.json");
export const modulePath = path.dirname(rootNodePath);

export async function setupFiles(dir: string = modulePath): Promise<MemoryFS> {
    const docfs = new MemoryFS(modulePath);
    const paths = await walkDir(dir);
    const promises: Array<Promise<void>> = [];
    for (const p of paths) {
        promises.push(docfs.load(p));
    }
    await Promise.all(promises);
    return docfs;
}

export async function loadNonCached(): Promise<NonCacheable> {
    const [nbtDocs] = await Promise.all([setupFiles()]);
    return { nbt_docs: nbtDocs };
}
