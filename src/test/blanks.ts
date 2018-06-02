import { PackLocationSegments } from "../misc_functions";
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
