import { CommandErrorBuilder } from "../../brigadier/errors";
import { DisplaySlots } from "../../data/nbt/nbt-types";
import { ReturnHelper } from "../../misc-functions";
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
                    false,
                    undefined,
                    "no"
                );
                if (helper.merge(result)) {
                    if (!info.suggesting) {
                        for (const objective of scoreboardData.data
                            .Objectives) {
                            if (objective.Name === result.data) {
                                helper.addActions({
                                    data: `${
                                        objective.DisplayName
                                    } - Criteria: ${objective.CriteriaName}`,
                                    high: reader.cursor,
                                    low: start,
                                    type: "hover"
                                });
                                break;
                            }
                        }
                        for (const slot of typed_keys(
                            scoreboardData.data.DisplaySlots
                        )) {
                            if (slot === result.data) {
                                helper.addActions({
                                    data: `Displayed in ${slotPurposes[slot]}`,
                                    high: reader.cursor,
                                    low: start,
                                    type: "hover"
                                });
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
            }
        }
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
                    false,
                    undefined,
                    "no"
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
        }
        return helper.succeed();
    }
};
export const criteriaParser = undefined;
