import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "argument.anchor.invalid",
    "Invalid entity anchor position %s"
);

export const parser = new ListParser("minecraft:entity_anchor", exc);
