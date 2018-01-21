import { readCache } from "./cache_management";
import { GlobalData, PackFolderData } from "./types";

export class DataManager {
    //#region Data Management
    private globalDataInternal: GlobalData;
    private packDataInternal: {
        [root: string]: PackFolderData,
    };
    /**
     * Get the information for the data packs.
     */
    public get packData(): DataManager["packDataInternal"] {
        return this.packDataInternal;
    }
    /**
     * The Global Data from this data Manager
     */
    public get globalData(): GlobalData {
        return this.globalDataInternal;
    }
    //#endregion
    //#region Constructor
    /**
     * Create a new DataManager instance. If a paramater is passed, it is used for Fake Data.
     *
     * Dummy Data can be included for running tests.
     * @param param0 Dummy Data to provide to the data manager.
     */
    constructor({ DummyGlobal, DummyPack }: {
        DummyGlobal?: DataManager["globalDataInternal"],
        DummyPack?: DataManager["packDataInternal"],
    } = {}) {
        if (!!DummyGlobal && !!DummyPack) {
            this.globalDataInternal = DummyGlobal;
            this.packDataInternal = DummyPack;
        }
    }
    //#endregion
    public async acquireData(): Promise<boolean> {
        const cache = await this.readCache();
        if (cache === true) {
            mcLangLog("Cache Successfully read");
            return true;
        } else {
            // Todo - try and get data from JAR.
            return false;
        }
    }

    private async readCache(): Promise<boolean> {
        try {
            this.globalDataInternal = await readCache();
            return true;
        } catch (error) {
            mcLangLog(`Reading cache failed with error ${JSON.stringify(error)}`);
            return false;
        }
    }
}
