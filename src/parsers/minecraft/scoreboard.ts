import { CompletionItemKind } from "vscode-languageserver";

import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { COLORS } from "../../colors";
import {
    blockCriteria,
    colorCriteria,
    entityCriteria,
    itemCriteria,
    verbatimCriteria
} from "../../data/lists/criteria";
import { entities } from "../../data/lists/statics";
import { DisplaySlots } from "../../data/nbt/nbt-types";
import {
    convertToNamespace,
    ReturnHelper,
    stringifyNamespace
} from "../../misc-functions";
import { typed_keys } from "../../misc-functions/third_party/typed-keys";
import { Parser } from "../../types";

const exceptions = {
    unknown_objective: new CommandErrorBuilder(
        "arguments.objective.notFound",
        "Unknown scoreboard objective '%s'"
    ),
    unknown_team: new CommandErrorBuilder("team.notFound", "Unknown team '%s'")
};

const slotPurposes: { [_ in keyof DisplaySlots]: string } = {
    slot_0: "list",
    slot_1: "sidebar",
    slot_10: "sidebar.team.gray",
    slot_11: "sidebar.team.dark_gray",
    slot_12: "sidebar.team.blue",
    slot_13: "sidebar.team.green",
    slot_14: "sidebar.team.aqua",
    slot_15: "sidebar.team.red",
    slot_16: "sidebar.team.light_purple",
    slot_17: "sidebar.team.yellow",
    slot_18: "sidebar.team.white",
    slot_2: "belowName",
    slot_3: "sidebar.team.black",
    slot_4: "sidebar.team.dark_blue",
    slot_5: "sidebar.team.dark_green",
    slot_6: "sidebar.team.dark_aqua",
    slot_7: "sidebar.team.dark_red",
    slot_8: "sidebar.team.dark_purple",
    slot_9: "sidebar.team.gold"
};

export const objectiveParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const start = reader.cursor;
        if (info.data.localData) {
            const scoreboardData = info.data.localData.nbt.scoreboard;
            if (scoreboardData) {
                const options = scoreboardData.data.Objectives.map(v => v.Name);
                const result = reader.readOption(
                    options,
                    StringReader.charAllowedInUnquotedString
                );
                if (helper.merge(result)) {
                    if (!info.suggesting) {
                        for (const objective of scoreboardData.data
                            .Objectives) {
                            if (objective.Name === result.data) {
                                helper.addActions({
                                    data: `Displayed as: ${
                                        objective.DisplayName
                                    }

Criteria: ${objective.CriteriaName}`,
                                    high: reader.cursor,
                                    low: start,
                                    type: "hover"
                                });
                                break;
                            }
                        }
                        if (scoreboardData.data.DisplaySlots) {
                            for (const slot of typed_keys(
                                scoreboardData.data.DisplaySlots
                            )) {
                                if (
                                    scoreboardData.data.DisplaySlots[slot] ===
                                    result.data
                                ) {
                                    helper.addActions({
                                        data: `Displayed in ${
                                            slotPurposes[slot]
                                        }`,
                                        high: reader.cursor,
                                        low: start,
                                        type: "hover"
                                    });
                                }
                            }
                        }
                    }
                } else {
                    if (result.data) {
                        helper.addErrors(
                            exceptions.unknown_objective.create(
                                start,
                                reader.cursor,
                                result.data
                            )
                        );
                    } else {
                        return helper.fail();
                    }
                }
                return helper.succeed();
            }
        }
        reader.readUnquotedString();
        return helper.succeed();
    }
};

export const teamParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        if (info.data.localData) {
            const scoreboardData = info.data.localData.nbt.scoreboard;
            if (scoreboardData) {
                const options = scoreboardData.data.Teams;
                const result = reader.readOption(
                    options.map(v => v.Name),
                    StringReader.charAllowedInUnquotedString
                );
                if (helper.merge(result)) {
                    for (const team of options) {
                        if (team.Name === result.data) {
                            helper.addActions({
                                data: `\`\`\`json
${JSON.stringify(team, undefined, 4)}
\`\`\``,
                                high: reader.cursor,
                                low: start,
                                type: "hover"
                            });
                            break;
                        }
                    }
                } else {
                    if (result.data) {
                        helper.addErrors(
                            exceptions.unknown_objective.create(
                                start,
                                reader.cursor,
                                result.data
                            )
                        );
                    } else {
                        return helper.fail();
                    }
                }
            }
        } else {
            reader.readUnquotedString();
        }
        return helper.succeed();
    }
};
const UNKNOWN_CRITERIA = new CommandErrorBuilder(
    "argument.criteria.invalid",
    "Unknown criteria '%s'"
);

const NONWHITESPACE = /\S/;

export const criteriaParser: Parser = {
    parse: (reader, info) => {
        const start = reader.cursor;
        const helper = new ReturnHelper(info);
        const optionResult = reader.readOption(
            [
                ...verbatimCriteria,
                ...blockCriteria,
                ...colorCriteria,
                ...entityCriteria,
                ...itemCriteria
            ],
            NONWHITESPACE,
            CompletionItemKind.EnumMember
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
                    NONWHITESPACE,
                    CompletionItemKind.Color
                );
                if (helper.merge(result)) {
                    return helper.succeed();
                }
            }
        }
        for (const choice of entityCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    entities.map(mapFunction),
                    NONWHITESPACE,
                    CompletionItemKind.Reference
                );
                if (helper.merge(result)) {
                    return helper.succeed();
                }
            }
        }
        for (const choice of blockCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    Object.keys(info.data.globalData.blocks).map(mapFunction),
                    NONWHITESPACE,
                    CompletionItemKind.Constant
                );
                if (helper.merge(result)) {
                    return helper.succeed();
                }
            }
        }
        for (const choice of itemCriteria) {
            if (text.startsWith(choice)) {
                reader.cursor = start + choice.length;
                const result = reader.readOption(
                    info.data.globalData.items.map(mapFunction),
                    NONWHITESPACE,
                    CompletionItemKind.Keyword
                );
                if (helper.merge(result)) {
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
