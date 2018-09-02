import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "effect.effectNotFound",
    "Unknown effect: %s"
);

export const parser = new ListParser("minecraft:mob_effect", exc);
