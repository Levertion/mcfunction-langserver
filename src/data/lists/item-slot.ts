export const itemSlots = slotsBuilder();

function slotsBuilder(): string[] {
    const slots = [];

    slots.push("armor.chest", "armor.feet", "armor.head", "armor.legs");

    for (let i = 0; i < 54; i++) {
        slots.push(`container.${i}`);
    }

    for (let i = 0; i < 27; i++) {
        slots.push(`enderchest.${i}`);
    }

    for (let i = 0; i < 25; i++) {
        slots.push(`horse.${i}`);
    }
    slots.push("horse.armor", "horse.chest", "horse.saddle");

    for (let i = 0; i < 9; i++) {
        slots.push(`hotbar.${i}`);
    }

    for (let i = 0; i < 27; i++) {
        slots.push(`inventory.${i}`);
    }

    for (let i = 0; i < 8; i++) {
        slots.push(`villager.${i}`);
    }

    slots.push("weapon", "weapon.mainhand", "weapon.offhand");
    return slots;
}
