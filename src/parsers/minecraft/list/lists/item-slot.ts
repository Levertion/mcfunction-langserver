import { ListSupplier } from "../lists";

class Supplier implements ListSupplier {
    private slots: string[] = [];

    public get(): string[] {
        return this.slots;
    }

    public init(): void {
        this.slots = [];

        this.slots.push(
            "armor.chest",
            "armor.feet",
            "armor.head",
            "armor.legs"
        );

        for (let i = 0; i < 54; i++) {
            this.slots.push(`container.${i}`);
        }

        for (let i = 0; i < 27; i++) {
            this.slots.push(`enderchest.${i}`);
        }

        for (let i = 0; i < 25; i++) {
            this.slots.push(`horse.${i}`);
        }
        this.slots.push("horse.armor", "horse.chest", "horse.saddle");

        for (let i = 0; i < 9; i++) {
            this.slots.push(`hotbar.${i}`);
        }

        for (let i = 0; i < 27; i++) {
            this.slots.push(`inventory.${i}`);
        }

        for (let i = 0; i < 8; i++) {
            this.slots.push(`villager.${i}`);
        }

        this.slots.push("weapon", "weapon.mainhand", "weapon.offhand");
    }
}

export = new Supplier();
