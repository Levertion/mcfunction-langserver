import { CompletionItemKind } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { COLORS } from "../../colors";
import {
    blockCriteria,
    colorCriteria,
    entityCriteria,
    itemCriteria,
    verbatimCriteria
} from "../../data/lists/criteria";
import { entities } from "../../data/lists/statics";
import {
    convertToNamespace,
    isSuccessful,
    ReturnHelper,
    stringifyNamespace
} from "../../misc-functions";
import { Parser } from "../../types";

const UNKNOWN_CRITERIA = new CommandErrorBuilder(
    "argument.criteria.invalid",
    "Unknown criteria '%s'"
);

const NONWHITESPACE = /\S/;

export const criteriaParser: Parser = {
    parse: (reader, info) => {
        const start = reader.cursor;
        const helper = new ReturnHelper();
        const optionResult = reader.readOption(
            [
                ...verbatimCriteria,
                ...blockCriteria,
                ...colorCriteria,
                ...entityCriteria,
                ...itemCriteria
            ],
            false,
            CompletionItemKind.EnumMember,
            NONWHITESPACE
        );
        const text = optionResult.data;
        if (helper.merge(optionResult)) {
            if (verbatimCriteria.indexOf(optionResult.data) !== -1) {
                return helper.succeed();
            }
        }
        if (!text) {
            return helper.fail(); // `unreachable!()`
        }
        const end = reader.cursor;
        for (const choice of colorCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    COLORS,
                    false,
                    CompletionItemKind.Color,
                    NONWHITESPACE
                );
                if (isSuccessful(result)) {
                    return helper.succeed();
                }
            }
        }
        for (const choice of entityCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    entities.map(mapFunction),
                    false,
                    CompletionItemKind.Color,
                    NONWHITESPACE
                );
                if (isSuccessful(result)) {
                    return helper.succeed();
                }
            }
        }
        for (const choice of blockCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    Object.keys(info.data.globalData.blocks).map(mapFunction),
                    false,
                    CompletionItemKind.Color,
                    NONWHITESPACE
                );
                if (isSuccessful(result)) {
                    return helper.succeed();
                }
            }
        }
        for (const choice of itemCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    info.data.globalData.items.map(mapFunction),
                    false,
                    CompletionItemKind.Color,
                    NONWHITESPACE
                );
                if (isSuccessful(result)) {
                    return helper.succeed();
                }
            }
        }
        helper.addErrors(UNKNOWN_CRITERIA.create(start, end, text));
        return helper.succeed();
    }
};

function mapFunction(value: string): string {
    return stringifyNamespace(convertToNamespace(value)).replace(":", ".");
}
