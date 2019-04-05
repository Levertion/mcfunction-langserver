import { stringArrayToIDs } from "../../misc-functions";

export const verbatimCriteria = new Set([
    "air",
    "armor",
    "deathCount",
    "dummy",
    "food",
    "health",
    "level",
    "playerKillCount",
    "totalKillCount",
    "trigger",
    "xp"
]);

export const colorCriteria = ["teamkill.", "killedByTeam."];

/**
 * @todo - Move to IDMap
 */
export const itemCriteria = stringArrayToIDs([
    "minecraft:broken",
    "minecraft:crafted",
    "minecraft:dropped",
    "minecraft:picked_up",
    "minecraft:used"
]);

export const blockCriteria = stringArrayToIDs(["minecraft:mined"]);

export const entityCriteria = stringArrayToIDs([
    "minecraft:killed_by",
    "minecraft:killed"
]);
