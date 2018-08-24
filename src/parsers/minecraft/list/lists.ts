import { typed_keys } from "../../../misc-functions/third_party/typed-keys";

export interface ListSupplier {
    get(): string[];
    init(): void;
}

const lists: { [key: string]: string } = {
    "minecraft:color": "./lists/color",
    "minecraft:entity_anchor": "./lists/entity-anchor",
    "minecraft:item_enchantment": "./lists/enchantment",
    "minecraft:item_slot": "./lists/item-slot",
    "minecraft:mob_effect": "./lists/effect",
    "minecraft:operation": "./lists/operation",
    "minecraft:particle": "./lists/particle",
    "minecraft:scoreboard_slot": "./lists/scoreboard-slot"
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
        for (const list of typed_keys(lists)) {
            const supplier = require(`${lists[list]}`) as ListSupplier;
            supplier.init();
            this.suppliers[list] = supplier;
        }
    }
}
