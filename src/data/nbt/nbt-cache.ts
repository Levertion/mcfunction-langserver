import * as path from "path";

import { readFileAsync } from "../../misc-functions";
import { WorldNBT } from "../../types";

import { Level, Scoreboard } from "./nbt-types";
import { parse } from "./parser";

export async function loadWorldNBT(worldLoc: string): Promise<WorldNBT> {
    const nbt: WorldNBT = {};

    await Promise.all([
        loadNBT<Level>(path.join(worldLoc, "./level.dat")).then(
            level => (nbt.level = level)
        ),
        loadNBT<Scoreboard>(path.join(worldLoc, "./data/scoreboard.dat")).then(
            scoreboard => (nbt.scoreboard = scoreboard)
        )
    ]);

    return nbt;
}

async function loadNBT<T>(loc: string): Promise<T | undefined> {
    try {
        const data: Buffer = await readFileAsync(loc);
        return await parse<T>(data);
    } catch (e) {
        return undefined;
    }
}
