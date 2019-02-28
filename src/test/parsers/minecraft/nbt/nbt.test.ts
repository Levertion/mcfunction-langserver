import { loadNBTDocs } from "../../../../data/noncached";
import { GlobalData } from "../../../../data/types";
import { convertToID } from "../../../../misc-functions";
import { nbtParser } from "../../../../parsers/minecraft/nbt/nbt";
import { ParserInfo } from "../../../../types";
import { snapshot, testParser } from "../../../assertions";

import { testDocs } from "./test-data";

describe("SNBT Parser", () => {
    const vanillaInfo: ParserInfo = {
        data: {
            globalData: {
                nbt_docs: loadNBTDocs()
            }
        },
        suggesting: true
    } as ParserInfo;
    const testInfo: ParserInfo = {
        context: {
            otherEntity: { ids: [convertToID("minecraft:zombie")] }
        },
        data: {
            globalData: {
                nbt_docs: testDocs
            } as GlobalData
        },
        node_properties: {},
        path: ["summon", "entity"],
        suggesting: true
    };

    const tester = testParser(nbtParser);
    it("should correctly parse a compound", () => {
        snapshot(tester(testInfo), "{foo:{bar:baz}}");
    });

    it("should return give the right results with vanilla data for a zombie", () => {
        snapshot(
            tester(vanillaInfo),
            "{",
            "{HandItems:[{",
            "{HandItems:[{display:{",
            "{HandItems:[{display:{"
        );
    });
});
