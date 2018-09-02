import { CommandErrorBuilder } from "../../../brigadier/errors";
import { ListParser } from "./list";

const exc = new CommandErrorBuilder(
    "arguments.operation.invalid",
    "Invalid operation"
);

export const parser = new ListParser("minecraft:operation", exc);
