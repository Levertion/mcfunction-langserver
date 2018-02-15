import { readCache } from "./cache_management";
import { getDatapacksResources, Resources } from "./datapack_resources";
import { GlobalData } from "./types";

export class DataManager {
    //#region Data Management
    private globalDataInternal: GlobalData = {} as GlobalData;
    private packDataInternal: {
        [root: string]: Resources,
    } = {};
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
        this.globalDataInternal = DummyGlobal || this.globalDataInternal;
        this.packDataInternal = DummyPack || this.packDataInternal;
    }
    //#endregion
    public async acquireData(): Promise<boolean> {
        const cache = await this.readCache();
        if (cache !== undefined) {
            this.globalDataInternal = cache;
            mcLangLog("Cache Successfully read");
            return true;
        } else {
            // Todo - try and get data from JAR.
            return false;
        }
    }

    public getPackFolderData(folder: string): Resources | undefined {
        return this.packDataInternal[folder];
    }

    public async aquirePackFolderData(folder: string) {
        if (!this.packDataInternal.hasOwnProperty(folder)) {
            this.packDataInternal[folder] = await getDatapacksResources(folder);
        }
    }

    private async readCache(): Promise<GlobalData | void> {
        try {
            return readCache();
        } catch (error) {
            mcLangLog(`Reading cache failed with error ${JSON.stringify(error)}`);
            return;
        }
    }
}
