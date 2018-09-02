import { COLORS } from "../../colors";

export const scoreboardSlots = createSlots();

function createSlots(): string[] {
    const slots = [];

    slots.push("list", "sidebar", "belowName");

    for (const s of COLORS) {
        slots.push(`sidebar.team.${s}`);
    }
    return slots;
}
