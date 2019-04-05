import * as assert from "assert";
import { DidChangeWatchedFilesParams } from "vscode-languageserver";

import { PackLocationSegments, ReturnHelper } from "../misc-functions";
import {
    CommandData,
    LocalData,
    ReturnedInfo,
    ReturnSuccess,
    WorldInfo
} from "../types";

import { readCache } from "./cache";
import { getPacksInfo } from "./datapack-resources";
import { collectGlobalData } from "./extractor";
import { loadNonCached } from "./noncached";

export class DataManager {
    /**
     * Create a datamanager using Dummy Data for running tests.
     */
    public static newWithData(
        dummyData?: DataManager["_commandData"],
        dummyPacks?: DataManager["packDataComplete"]
    ): DataManager {
        const manager = new DataManager();

        manager._commandData = dummyData || manager._commandData;
        Object.assign(manager.packDataComplete, dummyPacks);
        return manager;
    }

    private _commandData: CommandData = {} as CommandData;

    private readonly packDataComplete: { [root: string]: WorldInfo } = {};

    private readonly packDataPromises: {
        [root: string]: Promise<ReturnSuccess<WorldInfo>>;
    } = {};

    public get commandData(): CommandData {
        return this._commandData;
    }
    public get packData(): DataManager["packDataComplete"] {
        return this.packDataComplete;
    }

    public getPackFolderData(
        folder: PackLocationSegments | undefined
    ): LocalData | undefined {
        if (
            !!folder &&
            this.packDataComplete.hasOwnProperty(folder.packsFolder)
        ) {
            const info = this.packDataComplete[folder.packsFolder];

            return { ...info, current: info.packnamesmap.get(folder.pack) };
        }
        return undefined;
    }

    // tslint:disable-next-line: prefer-function-over-method
    public async handleChanges(
        _event: DidChangeWatchedFilesParams
    ): Promise<ReturnedInfo<undefined>> {
        return new ReturnHelper().succeed();
        /*  TODO - this is not an MVP feature.
         We have also received reports that this doesn't work, so it needs some debugging
         or implementation work. The original implementation is below: */
        /* 
        const helper = new ReturnHelper(false);
        const firsts = new Set<string>();
        const promises = event.changes.map(async change => {
            try {
                const parsedPath = parseDataPath(change.uri);
                if (parsedPath) {
                    interface InlineData {
                        data: WorldInfo;
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
                            pack.mcmeta = helper.merge(res)
                                ? res.data
                                : undefined;
                        }
                    } else {
                        const namespace = getKindAndNamespace(parsedPath.rest);
                        if (namespace) {
                            const { pack, packID, data } = await getData();
                            if (!firsts.has(parsedPath.packsFolder)) {
                                const shouldUpdateContents =
                                    change.type === FileChangeType.Changed &&
                                    resourceTypes[namespace.kind].mapFunction;
                                let contents = pack.data[namespace.kind];
                                if (
                                    (change.type === FileChangeType.Deleted ||
                                        shouldUpdateContents) &&
                                    !!contents
                                ) {
                                    for (let i = 0; i < contents.length; i++) {
                                        const element = contents[i];
                                        if (
                                            idsEqual(
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
                                        contents = pack.data[
                                            namespace.kind
                                        ] = [];
                                    }
                                    const newResource = {
                                        ...namespace.location,
                                        pack: packID
                                    };
                                    const actual = extname(change.uri);
                                    const expected =
                                        resourceTypes[namespace.kind].extension;
                                    if (actual === expected) {
                                        const mapFunction =
                                            // tslint:disable-next-line:no-unbound-method We control this function, so we know it won't use the this keyword.
                                            resourceTypes[namespace.kind]
                                                .mapFunction;
                                        if (mapFunction) {
                                            const result = await mapFunction(
                                                newResource,
                                                join(
                                                    parsedPath.packsFolder,
                                                    parsedPath.pack
                                                ),
                                                this._commandData,
                                                data
                                            );
                                            if (helper.merge(result)) {
                                                contents.push(result.data);
                                            }
                                        } else {
                                            contents.push(newResource);
                                        }
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
            } catch (error) {
                mcLangLog(
                    `Change ${JSON.stringify(
                        change
                    )} could not be completed, due to '${JSON.stringify(
                        error
                    )}'`
                );
            }
        });
        await Promise.all(promises);
        return helper.succeed();
     */
    }

    public async loadGlobalData(): Promise<boolean | string> {
        let version: string | undefined;
        if (!!this._commandData.data_info) {
            version = this._commandData.data_info.version;
        }
        try {
            const helper = new ReturnHelper();
            const data = await collectGlobalData(version);
            if (data) {
                helper.merge(data);
                if (this._commandData) {
                    this._commandData = {
                        ...this._commandData,
                        ...data.data
                    };
                } else {
                    this._commandData = {
                        ...(await loadNonCached()),
                        ...data.data
                    };
                }
            }
            assert.ok(this._commandData);
            return false;
        } catch (error) {
            return `Error loading global data: ${error.stack ||
                error.toString()}`;
        }
    }

    public async readCache(): Promise<boolean> {
        try {
            const cache = await readCache();
            const noncache = await loadNonCached();
            this._commandData = { ...cache, ...noncache };
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
            this.packDataPromises[folder] = getPacksInfo(
                folder,
                this._commandData.resources
            );
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
