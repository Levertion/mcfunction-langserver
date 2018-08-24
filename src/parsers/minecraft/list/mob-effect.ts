import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "effect.effectNotFound",
    "Unknown effect: %s"
);

export = new ListParser("minecraft:mob_effect", exc);
