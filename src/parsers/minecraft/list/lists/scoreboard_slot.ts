import { COLORS } from "../../../../colors";
import { ListSupplier } from "../lists";

export = class Supplier implements ListSupplier {
    private slot: string[] = [];

    public get(): string[] {
        return this.slot;
    }

    public init(): void {
        this.slot = [];

        this.slot.push("list", "sidebar", "belowName");

        for (const s of COLORS) {
            this.slot.push(`sidebar.team.${s}`);
        }
    }
};
