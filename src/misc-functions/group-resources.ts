import {
    GlobalData,
    ID,
    ResourceID,
    Resources,
    WorldInfo
} from "../data/types";
import { CommandData } from "../types";

import { idsEqual } from "./id";

export function getResourcesofType<T extends ResourceID = ResourceID>(
    resources: CommandData,
    type: keyof Resources
): T[] {
    return getResourcesSplit<T>(
        type,
        resources.globalData,
        resources.localData
    );
}

export function getResourcesSplit<T extends ResourceID = ResourceID>(
    type: keyof Resources,
    globalData: GlobalData,
    packsInfo?: WorldInfo
): T[] {
    const results: ResourceID[] = [];
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

export function getMatching<T extends ID>(resources: T[], value: T): T[] {
    const results: T[] = [];
    for (const resource of resources) {
        if (idsEqual(resource, value)) {
            results.push(resource);
        }
    }
    return results;
}
