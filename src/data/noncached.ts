import { nbtDocs, NBTNode, ValueList } from "mc-nbt-paths";
import { NBTDocs, NonCacheable } from "./types";

export function loadNBTDocs(): NBTDocs {
    const nbtData = new Map<string, NBTNode | ValueList>();
    Object.keys(nbtDocs).forEach(k => nbtData.set(k, nbtDocs[k]));
    return nbtData;
}

export async function loadNonCached(): Promise<NonCacheable> {
    return { nbt_docs: loadNBTDocs() };
}
