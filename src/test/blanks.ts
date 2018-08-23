import { GlobalData } from "../data/types";
import { PackLocationSegments } from "../misc-functions";
import { Lists } from "../parsers/minecraft/list/lists";
import { CommmandData } from "../types";
import { ReturnAssertionInfo, TestParserInfo } from "./assertions";

/**
 * Blank items for testing
 */

// tslint:disable-next-line:variable-name This allows for the property declaration shorthand
export const pack_segments: PackLocationSegments = {
    pack: "",
    packsFolder: "",
    rest: ""
};

export const succeeds: ReturnAssertionInfo = { succeeds: true };

export const blankproperties: TestParserInfo = {
    context: {},
    data: {} as CommmandData,
    node_properties: {},
    path: ["test"]
};

export const emptyGlobal: GlobalData = {
    blocks: {},
    commands: { type: "root" },
    items: [],
    meta_info: { version: "" },
    resources: {},
    static_lists: new Lists()
};
