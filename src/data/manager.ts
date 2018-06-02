import {
    DidChangeWatchedFilesParams,
    FileChangeType
} from "vscode-languageserver";

import { extname } from "path";
import { MCMETAFILE } from "../consts";
import {
    getKindAndNamespace,
    namespacesEqual,
    PackLocationSegments,
    parseDataPath,
    resourceTypes,
    ReturnHelper
} from "../misc_functions";
import { createExtensionFileError } from "../misc_functions/file_errors";
import { readJSON } from "../misc_functions/promisified_fs";
import { ReturnedInfo, ReturnSuccess } from "../types";
import { readCache } from "./cache_management";
import { getPacksInfo } from "./datapack_resources";
import { collectGlobalData } from "./extractor";
import {
    Datapack,
    DataPackID,
    GlobalData,
    McmetaFile,
    MinecraftResource,
    PacksInfo
} from "./types";

export class DataManager {
    /**
     * Create a datamanager using Dummy Data for running tests.
     */
    public static newWithData(
        dummyGlobal?: DataManager["globalDataInternal"],
        dummyPacks?: DataManager["packDataComplete"]
    ): DataManager {
        const manager = new DataManager();

        manager.globalDataInternal = dummyGlobal || manager.globalDataInternal;
        Object.assign(manager.packDataComplete, dummyPacks);
        return manager;
    }
    //#region Data Management
    private globalDataInternal: GlobalData = {} as GlobalData;

    private readonly packDataComplete: { [root: string]: PacksInfo } = {};

    private readonly packDataPromises: {
        [root: string]: Promise<ReturnSuccess<PacksInfo>>;
    } = {};

    public get globalData(): GlobalData {
        return this.globalDataInternal;
    }
    //#endregion
    //#region Constructor

    //#endregion

    public getPackFolderData(
        folder: PackLocationSegments | undefined
    ): PacksInfo | undefined {
        if (
            !!folder &&
            this.packDataComplete.hasOwnProperty(folder.packsFolder)
        ) {
            const info = this.packDataComplete[folder.packsFolder];

            return info;
        }
        return undefined;
    }

    public async handleChanges(
        event: DidChangeWatchedFilesParams
    ): Promise<ReturnedInfo<undefined>> {
        const helper = new ReturnHelper(false);
        const firsts = new Set<string>();
        const promises = event.changes.map(async change => {
            const parsedPath = parseDataPath(change.uri);
            if (parsedPath) {
                interface InlineData {
                    data: PacksInfo;
                    pack: Datapack;
                    packID: DataPackID;
                }
                const getData = async (): Promise<InlineData> => {
                    const first = await this.readPackFolderData(
                        parsedPath.packsFolder
                    );
                    if (first) {
                        firsts.add(parsedPath.packsFolder);
                    }
                    const data = this.getPackFolderData(parsedPath);
                    if (!data) {
                        throw new Error(
                            "Could not load data from datapacks folder"
                        );
                    }
                    const packID = data.packnamesmap[parsedPath.pack];
                    const pack = data.packs[packID];
                    return { data, pack, packID };
                };

                if (parsedPath.rest === MCMETAFILE) {
                    const { pack } = await getData();
                    if (!firsts.has(parsedPath.packsFolder)) {
                        const res = await readJSON<McmetaFile>(change.uri);
                        pack.mcmeta = helper.merge(res) ? res.data : undefined;
                    }
                } else {
                    const namespace = getKindAndNamespace(parsedPath.rest);
                    if (namespace) {
                        const { pack, packID } = await getData();
                        if (!firsts.has(parsedPath.packsFolder)) {
                            const shouldUpdateContents =
                                change.type === FileChangeType.Changed &&
                                resourceTypes[namespace.kind].readJson;
                            let contents = pack.data[namespace.kind];
                            if (
                                (change.type === FileChangeType.Deleted ||
                                    shouldUpdateContents) &&
                                !!contents
                            ) {
                                for (let i = 0; i < contents.length; i++) {
                                    const element = contents[i];
                                    if (
                                        namespacesEqual(
                                            element,
                                            namespace.location
                                        )
                                    ) {
                                        contents.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            if (
                                change.type === FileChangeType.Created ||
                                shouldUpdateContents
                            ) {
                                if (!contents) {
                                    contents = pack.data[namespace.kind] = [];
                                }
                                const newResource: MinecraftResource = {
                                    ...namespace.location,
                                    pack: packID
                                };
                                const actual = extname(change.uri);
                                const expected =
                                    resourceTypes[namespace.kind].extension;
                                if (actual === expected) {
                                    if (
                                        resourceTypes[namespace.kind].readJson
                                    ) {
                                        const data = await readJSON(change.uri);
                                        if (helper.merge(data)) {
                                            // @ts-ignore
                                            newResource.data = data.data;
                                        }
                                    }
                                    contents.push(newResource);
                                } else {
                                    helper.addMisc(
                                        createExtensionFileError(
                                            change.uri,
                                            expected,
                                            actual
                                        )
                                    );
                                }
                            }
                        }
                    }
                }
            }
        });
        await Promise.all(promises);
        return helper.succeed();
    }

    public async loadGlobalData(): Promise<true | string> {
        let version: string | undefined;
        if (!!this.globalData.meta_info) {
            version = this.globalData.meta_info.version;
        }
        try {
            const data = await collectGlobalData(version);
            this.globalDataInternal = data;
            return true;
        } catch (error) {
            return error.toString();
        }
    }

    public async readCache(): Promise<boolean> {
        try {
            const cache = await readCache();
            this.globalDataInternal = cache;
            mcLangLog("Cache Successfully read");
            return true;
        } catch (error) {
            mcLangLog(
                `Reading cache failed with error ${JSON.stringify(error)}`
            );
            return false;
        }
    }

    /**
     * @returns Whether this is the first request for this folder
     */
    public async readPackFolderData(
        folder: string
    ): Promise<ReturnedInfo<void>> {
        const helper = new ReturnHelper();
        if (!this.packDataPromises.hasOwnProperty(folder)) {
            this.packDataPromises[folder] = getPacksInfo(folder);
            const result = await this.packDataPromises[folder];
            this.packDataComplete[folder] = result.data;
            helper.merge(result);
            return helper.succeed();
        } else {
            await this.packDataPromises[folder];
            return helper.fail();
        }
    }
}
