import { root } from "mc-nbt-paths";
import * as path from "path";
import { walkDir } from "../misc-functions/promisified-fs";
import { MemoryFS } from "../parsers/minecraft/nbt/doc-fs";
import { NonCacheable } from "./types";

export const rootNodePath = root;
export const modulePath = path.dirname(rootNodePath);

export async function setupFiles(dir: string = modulePath): Promise<MemoryFS> {
    const docfs = new MemoryFS(dir);
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
