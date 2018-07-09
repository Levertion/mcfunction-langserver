import {
    GlobalData,
    MinecraftResource,
    NamespacedName,
    PacksInfo,
    Resources
} from "../data/types";
import { CommmandData } from "../types";
import { namespacesEqual } from "./namespace";

export function getResourcesofType<
    T extends MinecraftResource = MinecraftResource
>(resources: CommmandData, type: keyof Resources): T[] {
    return getResourcesSplit<T>(
        type,
        resources.globalData,
        resources.localData
    );
}

export function getResourcesSplit<
    T extends MinecraftResource = MinecraftResource
>(type: keyof Resources, globalData: GlobalData, packsInfo?: PacksInfo): T[] {
    const results: MinecraftResource[] = [];
    const globalResources = globalData.resources[type];
    if (!!globalResources) {
        results.push(...globalResources);
    }
    if (packsInfo) {
        for (const packId in packsInfo.packs) {
            if (packsInfo.packs.hasOwnProperty(packId)) {
                const pack = packsInfo.packs[packId];
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

export function getNamespaces<T extends NamespacedName>(
    resources: T[],
    value: T
): T[] {
    const results: T[] = [];
    for (const resource of resources) {
        if (namespacesEqual(resource, value)) {
            results.push(resource);
        }
    }
    return results;
}
