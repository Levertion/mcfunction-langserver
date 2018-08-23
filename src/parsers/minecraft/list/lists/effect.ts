import { ListSupplier } from "../lists";

const effects = [
    "minecraft:speed",
    "minecraft:slowness",
    "minecraft:haste",
    "minecraft:mining_fatigue",
    "minecraft:strength",
    "minecraft:instant_health",
    "minecraft:instant_damage",
    "minecraft:jump_boost",
    "minecraft:nausea",
    "minecraft:regeneration",
    "minecraft:resistance",
    "minecraft:fire_resistance",
    "minecraft:water_breathing",
    "minecraft:invisibility",
    "minecraft:blindness",
    "minecraft:night_vision",
    "minecraft:hunger",
    "minecraft:weakness",
    "minecraft:poison",
    "minecraft:wither",
    "minecraft:health_boost",
    "minecraft:absorption",
    "minecraft:saturation",
    "minecraft:glowing",
    "minecraft:levitation",
    "minecraft:luck",
    "minecraft:unluck",
    "minecraft:slow_falling",
    "minecraft:conduit_power",
    "minecraft:dolphins_grace"
];

const supplier: ListSupplier = {
    get: () => effects,
    init: () => undefined
};

export = supplier;
