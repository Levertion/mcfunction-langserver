import { stringArrayToNamespaces } from "../../misc-functions";

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

export const itemCriteria = stringArrayToNamespaces([
    "minecraft.broken",
    "minecraft.crafted",
    "minecraft.dropped",
    "minecraft.picked_up",
    "minecraft.used"
]);

export const blockCriteria = stringArrayToNamespaces(["minecraft.mined"]);

export const entityCriteria = stringArrayToNamespaces([
    "minecraft.killed_by",
    "minecraft.killed"
]);
