import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "enchantment.unknown",
    "Unknown enchantment: %s"
);

export = new ListParser("minecraft:item_enchantment", exc);
