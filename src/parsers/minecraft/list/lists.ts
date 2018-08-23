import { typed_keys } from "../../../misc-functions/third_party/typed-keys";

export interface ListSupplier {
    get(): string[];
    init(): void;
}

const lists: { [key: string]: string } = {
    "minecraft:color": "./lists/color",
    "minecraft:entity_anchor": "./lists/entity_anchor",
    "minecraft:item_enchantment": "./lists/enchantment",
    "minecraft:item_slot": "./lists/item_slot",
    "minecraft:mob_effect": "./lists/effect",
    "minecraft:operation": "./lists/operation",
    "minecraft:particle": "./lists/particle",
    "minecraft:scoreboard_slot": "./lists/scoreboard_slot"
};

export class Lists {
    protected suppliers: { [key: string]: ListSupplier };

    public constructor() {
        this.suppliers = {};
    }

    public getList(parserid: string): string[] {
        return this.suppliers[parserid].get();
    }

    public registerLists(): void {
        this.suppliers = {};
        for (const s of typed_keys(lists)) {
            const supplier = require(`./lists/${s}`) as ListSupplier;
            supplier.init();
            this.suppliers[s] = supplier;
        }
    }
}
