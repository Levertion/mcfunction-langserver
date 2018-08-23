import { ListSupplier } from "../lists";

export = class Supplier implements ListSupplier {
    private slot: string[] = [];

    public get(): string[] {
        return this.slot;
    }

    public init(): void {
        this.slot = [];

        this.slot.push("armor.chest", "armor.feet", "armor.head", "armor.legs");

        for (let i = 0; i < 54; i++) {
            this.slot.push(`container.${i}`);
        }

        for (let i = 0; i < 27; i++) {
            this.slot.push(`enderchest.${i}`);
        }

        for (let i = 0; i < 25; i++) {
            this.slot.push(`horse.${i}`);
        }
        this.slot.push("horse.armor", "horse.chest", "horse.saddle");

        for (let i = 0; i < 9; i++) {
            this.slot.push(`hotbar.${i}`);
        }

        for (let i = 0; i < 27; i++) {
            this.slot.push(`inventory.${i}`);
        }

        for (let i = 0; i < 8; i++) {
            this.slot.push(`villager.${i}`);
        }

        this.slot.push("weapon", "weapon.mainhand", "weapon.offhand");
    }
};
