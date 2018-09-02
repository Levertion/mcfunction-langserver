import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder("slot.unknown", "Unknown slot '%s'");

export const parser = new ListParser("minecraft:item_slot", exc);
