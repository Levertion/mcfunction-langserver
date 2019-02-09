import { CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { NONWHITESPACE } from "../../consts";
import { Scoreboard } from "../../data/nbt/nbt-types";
import { DataResource, NamespacedName } from "../../data/types";
import {
    convertToNamespace,
    getResourcesofType,
    getReturned,
    parseNamespaceOption,
    parseNamespaceOrTag,
    processParsedNamespaceOption,
    ReturnHelper,
    stringArrayEqual,
    stringArrayToNamespaces,
    stringifyNamespace
} from "../../misc-functions";
import { typed_keys } from "../../misc-functions/third_party/typed-keys";
import { ContextChange, Parser, ParserInfo, ReturnedInfo } from "../../types";
import { summonError } from "./namespace-list";
import { validateParse } from "./nbt/nbt";
import { MCRange, parseRange } from "./range";
// tslint:disable:cyclomatic-complexity
const uuidregex = /^[a-fA-F0-9]{1,8}-[a-fA-F0-9]{1,4}-[a-fA-F0-9]{1,4}-[a-fA-F0-9]{1,4}-[a-fA-F0-9]{1,12}$/;
/* Should be disabled if not wanted
https://github.com/Levertion/mcfunction-langserver/issues/89 */
const uuidwarn = new CommandErrorBuilder(
    "argument.entity.uuid",
    "Selecting an entity based on its UUID may cause instability [This warning can be disabled in the settings (Although not at the moment)]",
    DiagnosticSeverity.Warning
);
interface NodeProp {
    amount: "single" | "multiple";
    type: "entity" | "player";
}
type EntityContextType = { [K in ArgumentType]: {} };
interface TagInfo {
    /**
     * Whether there is an empty tag.
     *
     * True=>Entity must have a tag (`tag=!`)
     *
     * False=>Entity must not have a tag (`tag=`)
     */
    all?: boolean;
    set: Set<string>;
    unset: Set<string>;
}
interface TeamInfo {
    /**
     * Whether there is an empty team.
     *
     * True=>Entity must have a team (`team=!`)
     *
     * False=>Entity must not have a team (`team=`)
     */
    all?: boolean;
    set?: string;
    unset: Set<string>;
}
interface TypeInfo {
    set: Set<string>;
    unset: Set<string>;
}
interface EntityContextInner extends EntityContextType {
    advancements: Dictionary<AdvancementOption>;
    distance: MCRange;
    dx: number;
    dy: number;
    dz: number;
    gamemode: string[];
    level: MCRange;
    limit: number;
    name: Set<string>;
    nbt: {};
    scores: Dictionary<MCRange>;
    sort: string;
    tag: TagInfo;
    team: TeamInfo;
    type: TypeInfo;
    x: number;
    x_rotation: MCRange;
    y: number;
    y_rotation: MCRange;
    z: number;
}
export type EntityContext = Partial<EntityContextInner>;
type AdvancementOption = boolean | Dictionary<boolean>;
const contexterr = {
    oneEntity: new CommandErrorBuilder(
        "argument.entity.toomany",
        "Only one entity is allowed, but the provided selector allows more than one"
    ),
    onePlayer: new CommandErrorBuilder(
        "argument.player.toomany",
        "Only one player is allowed, but the provided selector allows more than one"
    ),
    onlyPlayer: new CommandErrorBuilder(
        "argument.player.entities",
        "Only players may be affected by this command, but the provided selector includes entities"
    )
};
export type ArgumentType =
    | "advancements"
    | "distance"
    | "dx"
    | "dy"
    | "dz"
    | "gamemode"
    | "level"
    | "limit"
    | "name"
    | "nbt"
    | "scores"
    | "sort"
    | "tag"
    | "team"
    | "type"
    | "x"
    | "x_rotation"
    | "y"
    | "y_rotation"
    | "z";
const errors = {
    duplicate: new CommandErrorBuilder(
        "argument.entity.option.duplicate",
        "Duplicate argument '%s'"
    ),
    gamemode: {
        expected: new CommandErrorBuilder(
            "argument.entity.option.gamemode.expected",
            "Expected gamemode"
        ),
        invalid: new CommandErrorBuilder(
            "argument.entity.option.gamemode.invalid",
            "Invalid gamemode '%s'"
        )
    },
    impossible: new CommandErrorBuilder(
        "argument.entity.option.nointersect",
        "Argument '%s' cannot match any entity"
    ),
    intOpt: {
        aboveMax: new CommandErrorBuilder(
            "argument.entity.option.number.abovemax",
            "Argument '%s' is greater than %s"
        ),
        belowMin: new CommandErrorBuilder(
            "argument.entity.option.number.belowmin",
            "Argument '%s' is less than %s"
        )
    },
    invalidSort: new CommandErrorBuilder(
        "argument.entity.option.sort.invalid",
        "Invalid sort type '%s'"
    ),
    noInfo: new CommandErrorBuilder(
        "argument.entity.option.noinfo",
        "Argument '%s' is redundant"
    ),
    unknownArg: new CommandErrorBuilder(
        "argument.entity.argument.unknown",
        "Unknown argument type '%s'"
    ),
    unknown_tag: new CommandErrorBuilder(
        "arguments.entity.tag.unknown",
        "Unknown entity tag '%s'"
    )
};
function getContextError(
    context: EntityContext,
    prop: NodeProp
): CommandErrorBuilder | undefined {
    if (
        prop.type === "player" &&
        context.type &&
        context.type.set &&
        context.type.set.size === 1 &&
        context.type.set.has("minecraft:player")
    ) {
        return contexterr.onlyPlayer;
    }
    if (prop.amount === "single" && context.limit !== 1) {
        return prop.type === "player"
            ? contexterr.onePlayer
            : contexterr.oneEntity;
    }
    return undefined;
}
export type OptionParser = (
    reader: StringReader,
    info: ParserInfo,
    context: EntityContext,
    argStart: number
) => ReturnedInfo<undefined>;
// tslint:disable-next-line:no-unnecessary-callback-wrapper it gives an error if it isn't wrapped
const gamemodes = ["survival", "creative", "adventure", "spectator"];
function isNegated(reader: StringReader, helper: ReturnHelper): boolean {
    return helper.merge(reader.expect("!"), { errors: false });
}
export const numOptParser = (
    float: boolean,
    min: number | undefined,
    max: number | undefined,
    key: ArgumentType
) => (
    reader: StringReader,
    _: ParserInfo,
    context: EntityContext,
    argStart: number
) => {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const res = float ? reader.readFloat() : reader.readInt();
    if (!helper.merge(res)) {
        return helper.fail();
    }
    const num = res.data;
    if (max && num > max) {
        helper.addErrors(
            errors.intOpt.aboveMax.create(
                start,
                reader.cursor,
                key,
                max.toString()
            )
        );
        return helper.succeed();
    }
    if (min && num < min) {
        helper.addErrors(
            errors.intOpt.belowMin.create(
                start,
                reader.cursor,
                key,
                min.toString()
            )
        );
        return helper.succeed();
    }
    // The entity context already has a value
    if (!!context[key]) {
        helper.addErrors(errors.duplicate.create(argStart, reader.cursor, key));
        return helper.succeed();
    }
    context[key] = num;
    return helper.succeed();
};
export const rangeOptParser = (
    float: boolean,
    min: number | undefined,
    max: number | undefined,
    key: ArgumentType
) => (
    reader: StringReader,
    _: ParserInfo,
    context: EntityContext,
    argStart: number
) => {
    const helper = new ReturnHelper();
    const start = reader.cursor;
    const res = parseRange(reader, float);
    if (!helper.merge(res)) {
        return helper.fail();
    }
    const range = res.data;
    if (range.max) {
        if (max && range.max > max) {
            helper.addErrors(
                errors.intOpt.aboveMax.create(
                    start,
                    reader.cursor,
                    key,
                    max.toString()
                )
            );
            return helper.succeed();
        }
        if (min && range.max < min) {
            helper.addErrors(
                errors.intOpt.belowMin.create(
                    start,
                    reader.cursor,
                    key,
                    min.toString()
                )
            );
            return helper.succeed();
        }
    }
    if (range.min) {
        if (max && range.min > max) {
            helper.addErrors(
                errors.intOpt.aboveMax.create(
                    start,
                    reader.cursor,
                    key,
                    max.toString()
                )
            );
            return helper.succeed();
        }
        if (min && range.min < min) {
            helper.addErrors(
                errors.intOpt.belowMin.create(
                    start,
                    reader.cursor,
                    key,
                    min.toString()
                )
            );
            return helper.succeed();
        }
    }
    if (!!context[key]) {
        helper.addErrors(errors.duplicate.create(argStart, reader.cursor, key));
        return helper.succeed();
    }
    context[key] = range;
    return helper.succeed();
};
export function parseScores(
    reader: StringReader,
    scoreboard: Scoreboard | undefined
): ReturnedInfo<Dictionary<MCRange>> {
    const helper = new ReturnHelper();
    if (!helper.merge(reader.expect("{"))) {
        return helper.fail();
    }
    const objnames = scoreboard
        ? scoreboard.data.Objectives.map(v => v.Name)
        : [];
    const out: Dictionary<MCRange> = {};
    if (!helper.merge(reader.expect("}"), { errors: false })) {
        while (true) {
            const res = scoreboard
                ? reader.readOption(objnames, {
                      quote: false,
                      unquoted: StringReader.charAllowedInUnquotedString
                  })
                : getReturned(reader.readUnquotedString());
            const data = res.data;
            if (!helper.merge(res) && data === undefined) {
                return helper.fail();
            }
            if (!helper.merge(reader.expect("="))) {
                return helper.fail();
            }
            const range = parseRange(reader);
            if (!helper.merge(range)) {
                return helper.fail();
            }
            out[data as string] = range.data;
            if (helper.merge(reader.expect(","), { errors: false })) {
                continue;
            } else if (helper.merge(reader.expect("}"), { errors: false })) {
                break;
            } else {
                const error = reader.expectOption(",", "}"); // Get the error for expected option
                return helper.mergeChain(error, { suggestions: false }).fail();
            }
        }
    }
    return helper.succeed(out);
}
export function parseAdvancements(
    reader: StringReader,
    info: ParserInfo
): ReturnedInfo<Dictionary<AdvancementOption>> {
    const advancements = getResourcesofType(info.data, "advancements");
    const helper = new ReturnHelper();
    if (!helper.merge(reader.expect("{"))) {
        return helper.fail();
    }
    const out: Dictionary<AdvancementOption> = {};
    while (true) {
        let advname: string;
        const criteriaOptions: string[] = [];
        const res = parseNamespaceOption<DataResource<string[]>>(
            reader,
            advancements
        );
        if (!helper.merge(res)) {
            if (!res.data) {
                return helper.fail();
            } else {
                advname = stringifyNamespace(res.data);
            }
        } else {
            advname = stringifyNamespace(res.data.literal);
            res.data.values
                .map(v => v.data)
                .filter(v => !!v)
                .forEach(v => criteriaOptions.push(...(v as string[])));
        }
        if (!helper.merge(reader.expect("="))) {
            return helper.fail();
        }
        if (helper.merge(reader.expect("{"), { errors: false })) {
            const criteria: Dictionary<boolean> = {};
            while (true) {
                const criterion = reader.readOption(criteriaOptions, {
                    quote: false,
                    unquoted: StringReader.charAllowedInUnquotedString
                });
                if (!helper.merge(criterion)) {
                    if (!criterion.data) {
                        return helper.fail();
                    }
                }
                if (!helper.merge(reader.expect("="))) {
                    return helper.fail();
                }
                const critval = reader.readBoolean();
                if (!helper.merge(critval)) {
                    return helper.fail();
                }
                criteria[criterion.data as string] = critval.data;
                if (helper.merge(reader.expect(","), { errors: false })) {
                    continue;
                } else if (
                    helper.merge(reader.expect("}"), { errors: false })
                ) {
                    break;
                } else {
                    const error = reader.expectOption(",", "}"); // Get the error for expected option
                    return helper
                        .mergeChain(error, { suggestions: false })
                        .fail();
                }
            }
            out[advname] = criteria;
        } else {
            const bool = reader.readBoolean();
            if (!helper.merge(bool)) {
                return helper.fail();
            }
            out[advname] = bool.data;
        }
        if (helper.merge(reader.expect(","), { errors: false })) {
            continue;
        } else if (helper.merge(reader.expect("}"), { errors: false })) {
            break;
        } else {
            const error = reader.expectOption(",", "}"); // Get the error for expected option
            return helper.mergeChain(error, { suggestions: false }).fail();
        }
    }
    return helper.succeed(out);
}
export const argParsers: { [K in ArgumentType]: OptionParser } = {
    advancements: (reader, info, context, argStart) => {
        const helper = new ReturnHelper();
        const res = parseAdvancements(reader, info);
        if (!helper.merge(res)) {
            return helper.fail();
        }
        if (context.advancements) {
            helper.addErrors(
                errors.duplicate.create(argStart, reader.cursor, "advancements")
            );
            Object.assign(context.advancements, res.data);
        } else {
            context.advancements = res.data;
        }
        return helper.succeed();
    },
    distance: rangeOptParser(true, 0, 3e7, "distance"),
    dx: numOptParser(true, undefined, undefined, "dx"),
    dy: numOptParser(true, undefined, undefined, "dy"),
    dz: numOptParser(true, undefined, undefined, "dz"),
    gamemode: (reader, _, context) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const negated = isNegated(reader, helper);
        const res = reader.readOption(gamemodes, {
            quote: false,
            unquoted: StringReader.charAllowedInUnquotedString
        });
        if (!helper.merge(res)) {
            if (res.data) {
                helper.addErrors(
                    errors.gamemode.invalid.create(
                        start,
                        reader.cursor,
                        res.data
                    )
                );
                return helper.succeed();
            } else {
                return helper.fail(
                    errors.gamemode.expected.create(start, reader.cursor)
                );
            }
        }
        const neglist = negated
            ? gamemodes.filter(v => v !== res.data)
            : [res.data];
        if (context.gamemode && stringArrayEqual(neglist, context.gamemode)) {
            helper.addErrors(errors.noInfo.create(start, reader.cursor));
            return helper.succeed();
        }
        const intTypes: string[] = context.gamemode
            ? context.gamemode.filter(v => neglist.indexOf(v) !== -1)
            : neglist;
        if (intTypes.length === 0) {
            helper.addErrors(
                errors.impossible.create(start, reader.cursor, "gamemode")
            );
            context.gamemode = [];
            return helper.succeed();
        } else {
            context.gamemode = intTypes;
            return helper.succeed();
        }
    },
    level: rangeOptParser(false, 0, undefined, "level"),
    limit: numOptParser(false, 1, undefined, "limit"),
    name: (reader, _, context) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const negated = isNegated(reader, helper);
        const restag = reader.readString();
        if (!helper.merge(restag)) {
            return helper.fail();
        }
        const name = restag.data;
        const fullname = `${negated ? "!" : ""}${name}`;
        if (context.name && context.name.has(fullname)) {
            helper.addErrors(
                errors.noInfo.create(start, reader.cursor, "name")
            );
            return helper.succeed();
        }
        const newNames = context.name || new Set();
        newNames.add(fullname);
        context.name = newNames;
        return helper.succeed();
    },
    nbt: (reader, info, context) => {
        const helper = new ReturnHelper();
        isNegated(reader, helper);
        const res = validateParse(reader, info, {
            ids: context.type &&
                context.type.set && [...context.type.set.values()],
            kind: "entity"
        });
        if (!helper.merge(res)) {
            return helper.fail();
        } else {
            return helper.succeed();
        }
    },
    scores: (reader, info, context, argStart) => {
        const helper = new ReturnHelper();
        const obj = parseScores(
            reader,
            info.data.localData ? info.data.localData.nbt.scoreboard : undefined
        );
        if (!helper.merge(obj)) {
            return helper.fail();
        }
        if (context.scores) {
            helper.addErrors(
                errors.duplicate.create(argStart, reader.cursor, "scores")
            );
            return helper.succeed();
        } else {
            context.scores = obj.data;
            return helper.succeed();
        }
    },
    sort: (reader, _, context, argStart) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const res = reader.readOption(
            ["arbitrary", "furthest", "nearest", "random"],
            {
                quote: false,
                unquoted: StringReader.charAllowedInUnquotedString
            }
        );
        if (!helper.merge(res)) {
            if (!res.data) {
                return helper.fail();
            } else {
                helper.addErrors(
                    errors.invalidSort.create(start, reader.cursor, res.data)
                );
            }
        }
        if (context.sort) {
            helper.addErrors(
                errors.duplicate.create(argStart, reader.cursor, "scores")
            );
            return helper.succeed();
        }
        context.sort = res.data;
        return helper.succeed();
    },
    tag: (reader, _, context) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const negated = isNegated(reader, helper);
        const tag = reader.readUnquotedString();
        const result: TagInfo = context.tag || {
            set: new Set(),
            unset: new Set()
        };
        if (tag === "") {
            if (result.all !== undefined) {
                if (result.all === negated) {
                    helper.addErrors(
                        errors.noInfo.create(start, reader.cursor, "tag")
                    );
                } else {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "tag")
                    );
                }
            } else {
                result.all = negated;
            }
            if (result.unset.size > 0) {
                if (!negated) {
                    helper.addErrors(
                        errors.duplicate.create(start, reader.cursor, "type")
                    );
                }
            }
            if (result.set.size > 0) {
                if (negated) {
                    helper.addErrors(
                        errors.duplicate.create(start, reader.cursor, "type")
                    );
                } else {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "type")
                    );
                }
            }
        } else {
            if (result.set.has(tag)) {
                if (negated) {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "tag")
                    );
                } else {
                    helper.addErrors(
                        errors.noInfo.create(start, reader.cursor, "tag")
                    );
                }
            }
            if (result.unset.has(tag)) {
                if (negated) {
                    helper.addErrors(
                        errors.noInfo.create(start, reader.cursor, "tag")
                    );
                } else {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "tag")
                    );
                }
            }
            if (result.all === false) {
                if (negated) {
                    helper.addErrors(
                        errors.noInfo.create(start, reader.cursor, "tag")
                    );
                } else {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "tag")
                    );
                }
            }
            if (negated) {
                result.unset.add(tag);
            } else {
                result.set.add(tag);
            }
        }
        context.tag = result;
        return helper.succeed();
    },
    team: (reader, info, context) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const negated = isNegated(reader, helper);
        const teamnames =
            (info.data.localData &&
                info.data.localData.nbt.scoreboard &&
                info.data.localData.nbt.scoreboard.data.Teams.map(
                    v => v.Name
                )) ||
            [];
        const res = reader.readOption(teamnames, {
            quote: false,
            unquoted: StringReader.charAllowedInUnquotedString
        });
        if (!helper.merge(res)) {
            if (res.data === undefined) {
                return helper.succeed();
            } else {
                return helper.fail();
            }
        }
        const teamInfo = context.team || { unset: new Set() };
        if (res.data === "") {
            if (teamInfo.all !== undefined) {
                if (teamInfo.all === !negated) {
                    helper.addErrors(
                        errors.noInfo.create(start, reader.cursor, "team")
                    );
                } else {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "team")
                    );
                }
            }
            teamInfo.all = !negated;
        } else {
            if (negated) {
                if (
                    teamInfo.unset.has(res.data) ||
                    teamInfo.all === false ||
                    teamInfo.set !== undefined
                ) {
                    helper.addErrors(
                        errors.noInfo.create(start, reader.cursor, "team")
                    );
                }
                teamInfo.unset.add(res.data);
            } else {
                if (
                    teamInfo.set !== undefined ||
                    teamInfo.unset.has(res.data) ||
                    teamInfo.all === false
                ) {
                    helper.addErrors(
                        errors.impossible.create(start, reader.cursor, "team")
                    );
                }
                teamInfo.set = res.data;
            }
        }
        context.team = teamInfo;
        return helper.succeed();
    },
    type: (reader, info, context) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const negated = isNegated(reader, helper);
        const parsedType = parseNamespaceOrTag(reader, info, "entity_tags");
        if (!helper.merge(parsedType)) {
            if (parsedType.data) {
                helper.addErrors(
                    errors.unknown_tag.create(
                        start,
                        reader.cursor,
                        stringifyNamespace(parsedType.data)
                    )
                );
                return helper.succeed();
            }
            return helper.fail();
        }
        if (!parsedType.data.resolved) {
            const postProcess = processParsedNamespaceOption(
                parsedType.data.parsed,
                stringArrayToNamespaces([
                    ...info.data.globalData.registries["minecraft:entity_type"]
                ]),
                info.suggesting && !reader.canRead(),
                start,
                CompletionItemKind.Event
            );
            helper.merge(postProcess);
            if (postProcess.data.length === 0) {
                helper.addErrors(
                    summonError.create(
                        start,
                        reader.cursor,
                        stringifyNamespace(parsedType.data.parsed)
                    )
                );
            }
        }
        const parsedTypes = parsedType.data.resolved || [
            parsedType.data.parsed
        ];
        const typeInfo = context.type || { set: new Set(), unset: new Set() };
        const { set, unset } = typeInfo;
        // tslint:disable-next-line:no-unnecessary-callback-wrapper
        const stringifiedTypes = parsedTypes.map(v => stringifyNamespace(v));
        if (!negated) {
            if (stringifiedTypes.every(set.has.bind(set))) {
                helper.addErrors(
                    errors.noInfo.create(start, reader.cursor, "type")
                );
            } else if (
                set.size > 0 &&
                !stringifiedTypes.some(set.has.bind(set))
            ) {
                helper.addErrors(
                    errors.impossible.create(start, reader.cursor, "type")
                );
            }
            if (stringifiedTypes.every(unset.has.bind(unset))) {
                helper.addErrors(
                    errors.impossible.create(start, reader.cursor, "type")
                );
            }
            for (const name of stringifiedTypes) {
                set.add(name);
            }
        } else {
            if (stringifiedTypes.every(set.has.bind(set))) {
                helper.addErrors(
                    errors.impossible.create(start, reader.cursor, "type")
                );
            }
            if (stringifiedTypes.every(unset.has.bind(unset))) {
                helper.addErrors(
                    errors.noInfo.create(start, reader.cursor, "type")
                );
            }
            for (const name of stringifiedTypes) {
                unset.add(name);
            }
        }
        context.type = { ...typeInfo, set, unset };
        return helper.succeed();
    },
    x: numOptParser(true, -3e7, 3e7 - 1, "x"),
    x_rotation: rangeOptParser(true, undefined, undefined, "x_rotation"),
    y: numOptParser(true, 0, 255, "y"),
    y_rotation: rangeOptParser(true, undefined, undefined, "y_rotation"),
    z: numOptParser(true, -3e7, 3e7 - 1, "z")
};
export class EntityBase implements Parser {
    private readonly fakePlayer: boolean;
    private readonly selector: boolean;
    public constructor(fakePlayer: boolean, selector: boolean) {
        this.fakePlayer = fakePlayer;
        this.selector = selector;
    }
    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<ContextChange> {
        const helper = new ReturnHelper(info);
        const start = reader.cursor;
        const playerSet = new Set<string>();
        const blankSet = new Set<string>();
        playerSet.add("minecraft:player");
        if (
            this.selector &&
            helper.merge(reader.expect("@"), {
                errors: false
            })
        ) {
            const context: EntityContext = {};
            const selectors: {
                [key in "p" | "a" | "r" | "s" | "e"]: EntityContext
            } = {
                a: { type: { set: playerSet, unset: blankSet } },
                e: {},
                p: { limit: 1, type: { set: playerSet, unset: blankSet } },
                r: { limit: 1, type: { set: playerSet, unset: blankSet } },
                s: {
                    limit: 1,
                    type: {
                        set: new Set(
                            // tslint:disable-next-line:no-unnecessary-callback-wrapper
                            ((info.context.executor || {}).ids || []).map(v =>
                                stringifyNamespace(v)
                            )
                        ),
                        unset: blankSet
                    }
                }
            };
            const exp = reader.expectOption(...typed_keys(selectors));
            if (!helper.merge(exp)) {
                // TODO, possibly better error message here
                return helper.fail();
            }
            Object.assign(context, selectors[exp.data]);
            if (
                helper.merge(reader.expect("["), {
                    errors: false
                })
            ) {
                const closeBracket = reader.expect("]");
                if (!helper.merge(closeBracket, { errors: false })) {
                    while (true) {
                        const argStart = reader.cursor;
                        const arg = reader.readOption(typed_keys(argParsers), {
                            quote: false,
                            unquoted: StringReader.charAllowedInUnquotedString
                        });
                        if (!helper.merge(arg, { errors: false })) {
                            helper.addErrors(
                                errors.unknownArg.create(
                                    argStart,
                                    reader.cursor
                                )
                            );
                            return helper.fail();
                        }
                        if (!helper.merge(reader.expect("="))) {
                            return helper.fail();
                        }
                        const opt = argParsers[arg.data];
                        const conc = opt(reader, info, context, argStart);
                        if (!helper.merge(conc)) {
                            return helper.fail();
                        }
                        if (conc.data) {
                            Object.assign(context, conc.data);
                        }
                        if (
                            helper.merge(reader.expect("]"), {
                                errors: false
                            })
                        ) {
                            break;
                        } else if (
                            helper.merge(reader.expect(","), { errors: false })
                        ) {
                            continue;
                        } else {
                            // TODO: a custom error for this case?
                            return helper.fail();
                        }
                    }
                }
            }
            const conterr = getContextError(
                context,
                info.node_properties as NodeProp
            );
            if (conterr) {
                helper.addErrors(conterr.create(start, reader.cursor));
            }
            return helper.succeed(getContextChange(context, info.path));
        } else if (uuidregex.test(reader.readWhileRegexp(/[0-9a-fA-F\-]/))) {
            helper.addErrors(uuidwarn.create(start, reader.cursor));
            const conterr = getContextError(
                {
                    limit: 1
                },
                info.node_properties as NodeProp
            );
            if (conterr) {
                helper.addErrors(
                    conterr.create(reader.cursor - 36, reader.cursor)
                );
            }
            return helper.succeed();
        } else {
            reader.cursor = start;
            if (this.fakePlayer) {
                const result = reader.readOption(
                    (
                        (info.data.localData &&
                            info.data.localData.nbt.scoreboard &&
                            info.data.localData.nbt.scoreboard.data
                                .PlayerScores) ||
                        []
                    ).map(score => score.Name),
                    { quote: false, unquoted: NONWHITESPACE }
                );
                const context: EntityContext = {
                    limit: 1,
                    type: { set: playerSet, unset: new Set() }
                };
                const contextErr = getContextError(
                    context,
                    info.node_properties as NodeProp
                );
                if (contextErr) {
                    helper.addErrors(contextErr.create(start, reader.cursor));
                }
                if (helper.merge(result) || result.data) {
                    return helper.succeed<ContextChange>(
                        getContextChange(context, info.path)
                    );
                } else {
                    // #unreachable!()
                    return helper.fail();
                }
            } else {
                const result = reader.readUnquotedString();
                if (result === "") {
                    return helper.fail();
                }
                const context: EntityContext = {
                    limit: 1,
                    type: { set: playerSet, unset: new Set() }
                };
                const contextErr = getContextError(
                    context,
                    info.node_properties as NodeProp
                );
                if (contextErr) {
                    helper.addErrors(contextErr.create(start, reader.cursor));
                }
                return helper.succeed<ContextChange>(
                    getContextChange(context, info.path)
                );
            }
        }
    }
}
function getContextChange(
    context: EntityContext,
    path: string[]
): ContextChange | undefined {
    if (context.type) {
        const result: NamespacedName[] = [];
        for (const item of context.type.set.values()) {
            if (!context.type.unset.has(item)) {
                result.push(convertToNamespace(item));
            }
        }
        if (stringArrayEqual(path, ["execute", "as", "entity"])) {
            return { executor: { ids: result } };
        } else {
            return { otherEntity: { ids: result } };
        }
    }
    return undefined;
}
export const entity = new EntityBase(false, true);
export const scoreHolder = new EntityBase(true, true);
export const gameProfile = new EntityBase(false, false);
