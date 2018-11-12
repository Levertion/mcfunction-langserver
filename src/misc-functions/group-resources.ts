import {
    GlobalData,
    MinecraftResource,
    NamespacedName,
    Resources,
    WorldInfo
} from "../data/types";
import { CommandData } from "../types";
import { namespacesEqual } from "./namespace";

export function getResourcesofType<
    T extends MinecraftResource = MinecraftResource
>(resources: CommandData, type: keyof Resources): T[] {
    return getResourcesSplit<T>(
        type,
        resources.globalData,
        resources.localData
    );
}

export function getResourcesSplit<
    T extends MinecraftResource = MinecraftResource
>(type: keyof Resources, globalData: GlobalData, packsInfo?: WorldInfo): T[] {
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

export function getMatching<T extends NamespacedName>(
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
