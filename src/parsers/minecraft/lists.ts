import { CompletionItemKind } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { COLORS } from "../../colors";
import { itemSlots } from "../../data/lists/item-slot";
import { scoreboardSlots } from "../../data/lists/scoreboard-slot";
import { anchors, operations } from "../../data/lists/statics";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../types";

export class ListParser implements Parser {
    private readonly error: CommandErrorBuilder;
    private readonly options: string[];

    public constructor(options: string[], err: CommandErrorBuilder) {
        this.options = options;
        this.error = err;
    }

    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<undefined> {
        const start = reader.cursor;
        const helper = new ReturnHelper(info);
        const optResult = reader.readOption(
            this.options,
            false,
            CompletionItemKind.EnumMember,
            "no"
        );
        if (helper.merge(optResult)) {
            return helper.succeed();
        } else {
            return helper.fail(
                this.error.create(
                    start,
                    reader.cursor,
                    optResult.data.toString()
                )
            );
        }
    }
}

const colorError = new CommandErrorBuilder(
    "argument.color.invalid",
    "Unknown color '%s'"
);
export const colorParser = new ListParser(COLORS, colorError);

const entityAnchorError = new CommandErrorBuilder(
    "argument.anchor.invalid",
    "Invalid entity anchor position %s"
);
export const entityAnchorParser = new ListParser(anchors, entityAnchorError);

const slotError = new CommandErrorBuilder("slot.unknown", "Unknown slot '%s'");
export const itemSlotParser = new ListParser(itemSlots, slotError);

const operationError = new CommandErrorBuilder(
    "arguments.operation.invalid",
    "Invalid operation"
);
export const operationParser = new ListParser(operations, operationError);

const scoreboardSlotError = new CommandErrorBuilder(
    "argument.scoreboardDisplaySlot.invalid",
    "Unknown display slot '%s'"
);
export const scoreBoardSlotParser = new ListParser(
    scoreboardSlots,
    scoreboardSlotError
);
