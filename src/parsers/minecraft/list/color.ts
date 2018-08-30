import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "argument.color.invalid",
    "Unknown color '%s'"
);

export = new ListParser("minecraft:color", exc);
