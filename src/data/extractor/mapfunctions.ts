import { join } from "path";

import { resourceTypes, ReturnHelper } from "../../misc-functions";
import { typed_keys } from "../../misc-functions/third_party/typed-keys";
import { Resources, ReturnSuccess } from "../../types";
import { GlobalData, Resources, WorldInfo } from "../types";

export async function runMapFunctions(
    resources: Resources,
    globalData: GlobalData,
    packRoot: string,
    localData?: WorldInfo
): Promise<ReturnSuccess<Resources>> {
    const result: Resources = {};
    const helper = new ReturnHelper();
    const promises: Array<Promise<void>> = [];
    for (const type of typed_keys(resources)) {
        type resourcesType = NonNullable<Resources[typeof type]>;
        const val = (result[type] = [] as resourcesType);
        const data = resources[type];
        // tslint:disable-next-line:no-unbound-method We control this function, so we know it won't use the this keyword.
        const mapFunction = resourceTypes[type].mapFunction;
        if (mapFunction) {
            promises.push(
                ...data.map(async v => {
                    const res = await mapFunction(
                        v,
                        packRoot,
                        globalData,
                        localData
                    );
                    helper.merge(res);
                    val.push(res.data);
                })
            );
        } else {
            val.push(...data);
        }
    }
    await Promise.all(promises);
    return helper.succeed(result);
}

export async function mapPacksInfo(
    packsInfo: WorldInfo,
    global: GlobalData
): Promise<ReturnSuccess<WorldInfo>> {
    const helper = new ReturnHelper();
    const result: WorldInfo = { ...packsInfo, packs: {} };
    const promises = typed_keys(packsInfo.packs).map(async packID => {
        const element = packsInfo.packs[packID];
        const subresult = await runMapFunctions(
            element.data,
            global,
            join(packsInfo.location, element.name),
            packsInfo
        );
        helper.merge(subresult);
        result.packs[packID] = { ...element, data: subresult.data };
    });
    await Promise.all(promises);
    return helper.succeed(result);
}
