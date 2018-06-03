import { readCache } from "./cache_management";
import { getDatapacks } from "./datapack_resources";
import { collectGlobalData } from "./extractor";
import { Datapack, GlobalData } from "./types";

export class DataManager {
  //#region Data Management
  private globalDataInternal: GlobalData = {} as GlobalData;

  private readonly packDataComplete: { [root: string]: Datapack[] } = {};
  private readonly packDataPromises: {
    [root: string]: Promise<Datapack[]>;
  } = {};

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
  public constructor({
    DummyGlobal,
    DummyPack
  }: {
    DummyGlobal?: DataManager["globalDataInternal"];
    DummyPack?: DataManager["packDataComplete"];
  } = {}) {
    this.globalDataInternal = DummyGlobal || this.globalDataInternal;
    this.packDataComplete = DummyPack || this.packDataComplete;
  }
  //#endregion
  public async getGlobalData(): Promise<true | string> {
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

  public getPackFolderData(folder: string | undefined): Datapack[] | undefined {
    if (!!folder && this.packDataComplete.hasOwnProperty(folder)) {
      return this.packDataComplete[folder];
    }
    return undefined;
  }

  public async readCache(): Promise<boolean> {
    try {
      const cache = await readCache();
      this.globalDataInternal = cache;
      mcLangLog("Cache Successfully read");
      return true;
    } catch (error) {
      mcLangLog(`Reading cache failed with error ${JSON.stringify(error)}`);
      return false;
    }
  }

  public async readPackFolderData(folder: string): Promise<void> {
    if (!this.packDataPromises.hasOwnProperty(folder)) {
      this.packDataPromises[folder] = getDatapacks(folder);
      this.packDataComplete[folder] = await this.packDataPromises[folder];
    } else {
      await this.packDataPromises[folder];
    }
  }
}
