import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "particle.notFound",
    "Unknown particle: %s"
);

export = new ListParser("minecraft:particle", exc);
