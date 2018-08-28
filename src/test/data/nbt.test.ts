import * as Long from "long";

import * as assert from "assert";
import * as fs from "fs";
import { isNumber } from "util";
import { loadNBT } from "../../data/nbt/nbt-cache";
import { LevelData } from "../../data/nbt/nbt-types";
import { parse } from "../../data/nbt/parser";

interface BigTest {
    // Sorry for the long line
    "byteArrayTest (the first 1000 values of (n*n*255+n*7)%100, starting with n=0 (0, 62, 34, 16, 8, ...))": number[];
    byteTest: number;
    doubleTest: number;
    floatTest: number;
    intTest: number;
    "listTest (compound)": Array<{
        "created-on": Long;
        name: string;
    }>;
    "listTest (long)": Long[];
    longTest: Long;
    "nested compound test": {
        egg: {
            name: string;
            value: number;
        };
        ham: {
            name: string;
            value: number;
        };
    };
    shortTest: number;
    stringTest: string;
}

const bigtest: BigTest = {
    // *thanks notch*
    "byteArrayTest (the first 1000 values of (n*n*255+n*7)%100, starting with n=0 (0, 62, 34, 16, 8, ...))": new Array<
        number
    >(1000)
        .fill(0)
        .map(
            (
                // @ts-ignore
                v,
                n
            ) => (n * n * 255 + n * 7) % 100
        ),
    byteTest: 127,
    doubleTest: 0.493128713218231,
    floatTest: 0.4982315,
    intTest: 2147483647,
    "listTest (compound)": [
        {
            "created-on": Long.fromString("1264099775885"),
            name: "Compound tag #0"
        },
        {
            "created-on": Long.fromString("1264099775885"),
            name: "Compound tag #1"
        }
    ],
    "listTest (long)": [11, 12, 13, 14, 15].map(v => Long.fromNumber(v)),
    longTest: Long.fromString("9223372036854775807"),
    "nested compound test": {
        egg: {
            name: "Eggbert",
            value: 0.5
        },
        ham: {
            name: "Hampus",
            value: 0.75
        }
    },
    shortTest: 32767,
    stringTest: "HELLO WORLD THIS IS A TEST STRING ÅÄÖ!"
};

describe("(binary) nbt parser tests", async () => {
    //
    it("should parse bigtest.nbt", async () => {
        const data = fs.readFileSync("test_data/test_nbt/bigtest.nbt");
        const nbt: BigTest = await parse<BigTest>(data);
        for (const rkey of Object.keys(nbt)) {
            const key = rkey as keyof BigTest;
            const val = nbt[key];
            const altval = bigtest[key];
            if (isNumber(val) && isNumber(altval) && !Number.isInteger(val)) {
                assert.strictEqual(altval.toPrecision(7), val.toPrecision(7));
            } else {
                assert.deepStrictEqual(val, altval);
            }
        }
    });

    it("should parse level.dat", async () => {
        const nbt = await loadNBT("test_data/test_world");
        if (!!nbt.level) {
            const data = nbt.level.Data;
            assert.strictEqual(data.version, 19133);
            assert.deepStrictEqual(data.Version, {
                Id: 1628,
                Name: "1.13.1",
                Snapshot: 0
            } as LevelData["Version"]);
            assert.deepStrictEqual(data.CustomBossEvents, {
                bossbar: {
                    Color: "red",
                    CreateWorldFog: 0,
                    DarkenScreen: 0,
                    Max: 20,
                    Name: `{"color":"white","text":"Custom Bar"}`,
                    Overlay: "notched_20",
                    PlayBossMusic: 0,
                    Players: [
                        {
                            L: Long.fromString("-7482673864369647603"),
                            M: Long.fromString("-694532656901238868")
                        }
                    ],
                    Value: 0,
                    Visible: 1
                }
            } as LevelData["CustomBossEvents"]);
        } else {
            assert.fail("level.dat not loaded");
        }
    });
});
