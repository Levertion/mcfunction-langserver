import { typed_keys } from "../../../misc-functions/third_party/typed-keys";
import { colorSupplier } from "./lists/color";
import { effectSupplier } from "./lists/effect";
import { enchantmentSupplier } from "./lists/enchantment";
import { entityAnchorSupplier } from "./lists/entity-anchor";
import { itemSlotSupplier } from "./lists/item-slot";
import { operationSupplier } from "./lists/operation";
import { particleSupplier } from "./lists/particle";
import { scoreboardSlotSupplier } from "./lists/scoreboard-slot";

export interface ListSupplier {
    get(): string[];
    init(): void;
}

export const lists: { [key: string]: ListSupplier } = {
    "minecraft:color": colorSupplier,
    "minecraft:entity_anchor": entityAnchorSupplier,
    "minecraft:item_enchantment": enchantmentSupplier,
    "minecraft:item_slot": itemSlotSupplier,
    "minecraft:mob_effect": effectSupplier,
    "minecraft:operation": operationSupplier,
    "minecraft:particle": particleSupplier,
    "minecraft:scoreboard_slot": scoreboardSlotSupplier
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
            const supplier = JSON.parse(JSON.stringify(lists[list]));
            supplier.init();
            this.suppliers[list] = supplier;
        }
    }
}
