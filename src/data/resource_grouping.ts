import { CommmandData } from "../types";
import { MinecraftResource, NamespaceData } from "./datapack_resources";

export function groupResources<T extends MinecraftResource = MinecraftResource>(resources: CommmandData,
    type: keyof NamespaceData): T[] {
    const results: MinecraftResource[] = [];
    {
        const globalResources = resources.globalData.resources[type];
        if (!!globalResources) {
            results.push(...globalResources);
        }
    }
    if (!!resources.localData) {
        const localData = resources.localData.data;
        for (const namespace of Object.keys(localData)) {
            const localResources = localData[namespace][type];
            if (!!localResources) {
                results.push(...localResources);
            }
        }
    }
    return results as T[];
}
