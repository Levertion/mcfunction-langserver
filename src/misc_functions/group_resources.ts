import { MinecraftResource, Resources } from "../data/types";
import { CommmandData } from "../types";

export function getResourcesofType<
    T extends MinecraftResource = MinecraftResource
>(resources: CommmandData, type: keyof Resources): T[] {
    const results: MinecraftResource[] = [];
    const globalResources = resources.globalData.resources[type];
    if (!!globalResources) {
        results.push(...globalResources);
    }
    if (!!resources.localData) {
        const localData = resources.localData;
        for (const packId in localData.packs) {
            if (localData.packs.hasOwnProperty(packId)) {
                const pack = localData.packs[packId];
                if (pack.data.hasOwnProperty(type)) {
                    const data = pack.data[type];
                    if (!!data) {
                        results.push(...data);
                    }
                }
            }
        }
    }
    return results as T[];
}
