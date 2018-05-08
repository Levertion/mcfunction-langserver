import { MinecraftResource, NamespaceData } from "../data/types";
import { CommmandData } from "../types";

export function getResourcesofType<T extends MinecraftResource = MinecraftResource>(
    resources: CommmandData, type: keyof NamespaceData): T[] {
    const results: MinecraftResource[] = [];
    const globalResources = resources.globalData.resources[type];
    if (!!globalResources) {
        results.push(...globalResources);
    }
    if (!!resources.localData) {
        const localData = resources.localData;
        for (const pack of localData) {
            for (const namespace in pack.namespaces) {
                if (pack.namespaces.hasOwnProperty(namespace)) {
                    const namespaceData = pack.namespaces[namespace];
                    const data = namespaceData[type];
                    if (!!data) {
                        results.push(...data);
                    }
                }
            }
        }
    }
    return results as T[];
}
