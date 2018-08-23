import { ListSupplier } from "../lists";

const particle = [
    "minecraft:ambient_entity_effect",
    "minecraft:angry_villager",
    "minecraft:barrier",
    "minecraft:block",
    "minecraft:bubble",
    "minecraft:cloud",
    "minecraft:crit",
    "minecraft:damage_indicator",
    "minecraft:dragon_breath",
    "minecraft:dripping_lava",
    "minecraft:dripping_water",
    "minecraft:dust",
    "minecraft:effect",
    "minecraft:elder_guardian",
    "minecraft:enchanted_hit",
    "minecraft:enchant",
    "minecraft:end_rod",
    "minecraft:entity_effect",
    "minecraft:explosion_emitter",
    "minecraft:explosion",
    "minecraft:falling_dust",
    "minecraft:firework",
    "minecraft:fishing",
    "minecraft:flame",
    "minecraft:happy_villager",
    "minecraft:heart",
    "minecraft:instant_effect",
    "minecraft:item",
    "minecraft:item_slime",
    "minecraft:item_snowball",
    "minecraft:large_smoke",
    "minecraft:lava",
    "minecraft:mycelium",
    "minecraft:note",
    "minecraft:poof",
    "minecraft:portal",
    "minecraft:rain",
    "minecraft:smoke",
    "minecraft:spit",
    "minecraft:squid_ink",
    "minecraft:sweep_attack",
    "minecraft:totem_of_undying",
    "minecraft:underwater",
    "minecraft:splash",
    "minecraft:witch",
    "minecraft:bubble_pop",
    "minecraft:current_down",
    "minecraft:bubble_column_up",
    "minecraft:nautilus"
];

const supplier: ListSupplier = {
    get: () => particle,
    init: () => undefined
};

export = supplier;
