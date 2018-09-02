import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "particle.notFound",
    "Unknown particle: %s"
);

export const parser = new ListParser("minecraft:particle", exc);
