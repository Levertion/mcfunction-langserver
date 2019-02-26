import * as path from "path";

import { readFileAsync } from "../../misc-functions";
import { WorldNBT } from "../types";

import { Level, Scoreboard } from "./nbt-types";
import { parse } from "./parser";

export async function loadNBT(worldLoc: string): Promise<WorldNBT> {
    const nbt: WorldNBT = {} as WorldNBT;

    const levelpath = path.resolve(worldLoc, "./level.dat");
    try {
        const levelbuf: Buffer = await readFileAsync(levelpath);
        nbt.level = await parse<Level>(levelbuf);
    } catch (e) {
        // Level doesn't exist
    }

    const scpath = path.resolve(worldLoc, "./data/scoreboard.dat");
    try {
        const scoreboardbuf: Buffer = await readFileAsync(scpath);
        nbt.scoreboard = await parse<Scoreboard>(scoreboardbuf);
    } catch (e) {
        // Scoreboard file doesn't exist
    }

    return nbt;
}
