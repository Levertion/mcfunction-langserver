import { CompletionItemKind } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { COLORS } from "../../colors";
import { itemSlots } from "../../data/lists/item-slot";
import { scoreboardSlots } from "../../data/lists/scoreboard-slot";
import {
    anchors,
    effects,
    enchantments,
    operations,
    particles
} from "../../data/lists/statics";
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
                this.error.create(start, reader.cursor, optResult.data)
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

const enchantmentError = new CommandErrorBuilder(
    "enchantment.unknown",
    "Unknown enchantment: %s"
);
export const enchantmentParser = new ListParser(enchantments, enchantmentError);

const slotError = new CommandErrorBuilder("slot.unknown", "Unknown slot '%s'");
export const itemSlotParser = new ListParser(itemSlots, slotError);

const mobEffectError = new CommandErrorBuilder(
    "effect.effectNotFound",
    "Unknown effect: %s"
);
export const mobEffectParser = new ListParser(effects, mobEffectError);

const operationError = new CommandErrorBuilder(
    "arguments.operation.invalid",
    "Invalid operation"
);
export const operationParser = new ListParser(operations, operationError);

const particleError = new CommandErrorBuilder(
    "particle.notFound",
    "Unknown particle: %s"
);
export const particleParser = new ListParser(particles, particleError);

const scoreboardSlotError = new CommandErrorBuilder(
    "argument.scoreboardDisplaySlot.invalid",
    "Unknown display slot '%s'"
);
export const scoreBoardSlotParser = new ListParser(
    scoreboardSlots,
    scoreboardSlotError
);
