import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "argument.scoreboardDisplaySlot.invalid",
    "Unknown display slot '%s'"
);

export const parser = new ListParser("minecraft:scoreboard_slot", exc);
