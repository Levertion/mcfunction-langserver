import { COLORS } from "../../../../colors";
import { ListSupplier } from "../lists";

class Supplier implements ListSupplier {
    private slots: string[] = [];

    public get(): string[] {
        return this.slots;
    }

    public init(): void {
        this.slots = [];

        this.slots.push("list", "sidebar", "belowName");

        for (const s of COLORS) {
            this.slots.push(`sidebar.team.${s}`);
        }
    }
}

export = new Supplier();
