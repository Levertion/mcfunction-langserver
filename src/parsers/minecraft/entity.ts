import { DiagnosticSeverity } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { QUOTE, StringReader } from "../../brigadier/string-reader";
import { JAVAMAXINT, JAVAMININT } from "../../consts";
import { entities } from "../../data/lists/statics";
import { Scoreboard } from "../../data/nbt/nbt-types";
import { DataResource, NamespacedName } from "../../data/types";
import {
    convertToNamespace,
    getResourcesofType,
    namespacesEqual,
    parseNamespaceOption,
    parseNamespaceOrTag,
    ReturnHelper,
    stringArrayEqual
} from "../../misc-functions";
import { ContextChange, Parser, ParserInfo, ReturnedInfo } from "../../types";
import { nbtParser } from "./nbt/nbt";
import { MCRange, rangeParser } from "./range";
// tslint:disable:cyclomatic-complexity
const uuidregex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g;

/*
https://github.com/Levertion/mcfunction-langserver/issues/89
*/
const uuidwarn = new CommandErrorBuilder(
    "argument.entity.uuid",
    "Selecting an entity based on its UUID may cause instability [This warning can be disabled in the settings]",
    DiagnosticSeverity.Warning
);

interface NodeProp {
    amount: "single" | "multiple";
    type: "entity" | "player";
}

interface EntityContext {
    advancements?: Map<NamespacedName, AdvancementOption>;
    distance?: MCRange;
    dx?: number;
    dy?: number;
    dz?: number;
    gamemode?: string[];
    level?: MCRange;
    limit?: number;
    names?: string[];
    scores?: Dictionary<MCRange>;
    sort?: string;
    tags?: string[];
    team?: string[];
    type?: string[];
    x?: number;
    x_rotation?: MCRange;
    y?: number;
    y_rotation?: MCRange;
    z?: number;
}

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

function getContextError(
    cont: EntityContext,
    prop: NodeProp
): CommandErrorBuilder | undefined {
    if (
        prop.type === "player" &&
        stringArrayEqual(cont.type || [], ["minecraft:player"])
    ) {
        return contexterr.onlyPlayer;
    }
    if (prop.amount === "single" && cont.limit !== 1) {
        return prop.type === "entity"
            ? contexterr.oneEntity
            : contexterr.onePlayer;
    }
    return undefined;
}

type OptionParser = (
    reader: StringReader,
    info: ParserInfo,
    context: EntityContext
) => ReturnedInfo<EntityContext | undefined>;

// tslint:disable-next-line:no-unnecessary-callback-wrapper it gives an error if it isn't wrapped
const nsEntity = entities.map(v => convertToNamespace(v));

const gamemodes = ["survival", "creative", "adventure", "spectator"];

function isNegated(reader: StringReader, helper: ReturnHelper): boolean {
    helper.addSuggestion(reader.cursor, "!");
    const neg = reader.peek() === "!";
    if (neg) {
        reader.skip();
    }
    return neg;
}

const intOptParser = (min: number, max: number, key: keyof EntityContext) => (
    reader: StringReader,
    _: ParserInfo,
    context: EntityContext
) => {
    const helper = new ReturnHelper();
    const res = reader.readInt();
    if (!helper.merge(res)) {
        return helper.fail();
    }
    const num = res.data;
    if (num > max || num < min) {
        // Add error
        return helper.succeed();
    }
    // The entity context already has a value
    if (!!context[key]) {
        // Add error
        return helper.succeed();
    }
    const out: EntityContext = {};
    out[key] = num;
    return helper.succeed(out);
};

const rangeOptParser = (
    float: boolean,
    min: number,
    max: number,
    key: keyof EntityContext
) => (reader: StringReader, _: ParserInfo, context: EntityContext) => {
    const helper = new ReturnHelper();
    const res = rangeParser(float)(reader);

    if (!helper.merge(res)) {
        return helper.fail();
    }

    const range = res.data;

    if (range.max) {
        if (range.max > max || range.max < min) {
            helper.addErrors();
            return helper.succeed();
        }
    }
    if (range.min) {
        if (range.min > max || range.min < min) {
            helper.addErrors();
            return helper.succeed();
        }
    }
    if (!!context[key]) {
        helper.addErrors();
        return helper.succeed();
    }
    const out: EntityContext = {};
    out[key] = range;
    return helper.succeed(out);
};

function parseScores(
    reader: StringReader,
    scoreboard: Scoreboard | undefined
): ReturnedInfo<Dictionary<MCRange>> {
    const helper = new ReturnHelper();
    if (!helper.merge(reader.expect("{"))) {
        return helper.fail();
    }
    const objnames = scoreboard
        ? scoreboard.data.Objectives.map(v => v.Name)
        : undefined;
    const out: Dictionary<MCRange> = {};

    let next = "{";
    while (next !== "}") {
        let obj: string;
        if (objnames) {
            const res = reader.readOption(objnames, {
                quote: false,
                unquoted: StringReader.charAllowedInUnquotedString
            });
            if (!helper.merge(res) && !res.data) {
                return helper.fail();
            }
            obj = res.data as string;
        } else {
            obj = reader.readUnquotedString();
        }
        if (obj === "") {
            return helper.fail();
        }

        const range = rangeParser(false)(reader);
        if (!helper.merge(range)) {
            return helper.fail();
        }
        out[obj] = range.data;

        const end = reader.expectOption(",", "}");
        if (!helper.merge(end)) {
            return helper.fail();
        }
        next = end.data;
    }
    return helper.succeed(out);
}

function parseAdvancements(
    reader: StringReader,
    info: ParserInfo
): ReturnedInfo<Map<NamespacedName, AdvancementOption>> {
    const adv = getResourcesofType(info.data, "advancements");

    const helper = new ReturnHelper();

    if (!helper.merge(reader.expect("{"))) {
        return helper.fail();
    }

    const out = new Map<NamespacedName, AdvancementOption>();

    let next = "{";
    while (next !== "}") {
        let advname: NamespacedName;

        const criteriaOptions: string[] = [];

        const res = parseNamespaceOption(
            reader,
            adv.map<NamespacedName>(v => ({
                namespace: v.namespace,
                path: v.path
            }))
        );
        if (!helper.merge(res)) {
            if (!res.data) {
                return helper.fail();
            } else {
                advname = res.data;
            }
        } else {
            advname = res.data.literal;
            res.data.values.forEach(v =>
                criteriaOptions.push(
                    ...((v as DataResource<string[]>).data as string[])
                )
            );
        }

        if (!helper.merge(reader.expect("="))) {
            return helper.fail();
        }

        if (reader.peek() === "{") {
            reader.skip();
            let cnext = "{";

            const criteria: Dictionary<boolean> = {};

            while (cnext !== "}") {
                const criterion = reader.readOption(criteriaOptions, {
                    quote: false,
                    unquoted: StringReader.charAllowedInUnquotedString
                });
                if (!helper.merge(criterion)) {
                    if (!criterion.data) {
                        return helper.fail();
                    }
                }
                if (criterion.data === "") {
                    return helper.fail();
                }

                if (!helper.merge(reader.expect("="))) {
                    return helper.fail();
                }

                const critval = reader.readBoolean();
                if (!helper.merge(critval)) {
                    return helper.fail();
                }

                criteria[criterion.data as string] = critval.data;

                const cend = reader.expectOption(",", "}");
                if (!helper.merge(cend)) {
                    return helper.fail();
                }
                cnext = cend.data;
            }
            out.set(advname, criteria);
        } else {
            const bool = reader.readBoolean();
            if (!helper.merge(bool)) {
                return helper.fail();
            }
            out.set(advname, bool.data);
        }

        const end = reader.expectOption(",", "}");
        if (!helper.merge(end)) {
            return helper.fail();
        }
        next = end.data;
    }

    return helper.succeed(out);
}

const options: { [key: string]: OptionParser } = {
    advancements: (reader, info, context) => {
        const helper = new ReturnHelper();
        const res = parseAdvancements(reader, info);
        if (!helper.merge(res)) {
            return helper.fail();
        }
        if (context.advancements) {
            helper.addErrors();
            return helper.succeed();
        } else {
            return helper.succeed({
                advancements: res.data
            } as EntityContext);
        }
    },
    distance: rangeOptParser(true, 0, 3e7, "distance"),
    dx: intOptParser(-3e7, 3e7 - 1, "dx"),
    dy: intOptParser(-3e7, 3e7 - 1, "dy"),
    dz: intOptParser(-3e7, 3e7 - 1, "dz"),
    gamemode: (reader, _, context) => {
        const helper = new ReturnHelper();

        const negated = isNegated(reader, helper);

        const res = reader.readOption(gamemodes);
        if (!helper.merge(res)) {
            if (res.data) {
                return helper.succeed();
            } else {
                return helper.fail();
            }
        }
        const neglist = negated
            ? gamemodes.filter(v => v !== res.data)
            : [res.data];

        if (context.gamemode && stringArrayEqual(neglist, context.gamemode)) {
            // Duplicate
            helper.addErrors();
            return helper.succeed();
        }

        const intTypes: string[] = context.gamemode
            ? context.gamemode.filter(v => neglist.indexOf(v) !== -1)
            : neglist;

        if (intTypes.length === 0) {
            helper.addErrors();
            return helper.succeed();
        } else {
            return helper.succeed({
                gamemode: intTypes
            } as EntityContext);
        }
    },
    level: rangeOptParser(false, 0, JAVAMAXINT, "level"),
    limit: intOptParser(1, JAVAMAXINT, "limit"),
    name: (reader, _, context) => {
        const helper = new ReturnHelper();

        const negated = isNegated(reader, helper);

        const quoted = reader.peek() === QUOTE;
        const restag = reader.readString();
        if (!helper.merge(restag)) {
            return helper.fail();
        }
        const name = restag.data;
        if (!quoted && name === "") {
            return helper.fail();
        }
        if (
            context.names &&
            context.names.indexOf(`${negated ? "!" : ""}${name}`) !== -1
        ) {
            helper.addErrors();
            return helper.succeed();
        }
        return helper.succeed({
            tags: [...(context.names || []), `${negated ? "!" : ""}${name}`]
        });
    },
    nbt: (reader, info) => {
        const helper = new ReturnHelper();
        isNegated(reader, helper);
        const res = nbtParser.parse(reader, info);
        if (!helper.merge(res)) {
            return helper.fail();
        } else {
            return helper.succeed();
        }
    },
    scores: (reader, info, context) => {
        const helper = new ReturnHelper();
        /*const start = reader.cursor;*/
        const obj = parseScores(
            reader,
            info.data.localData ? info.data.localData.nbt.scoreboard : undefined
        );
        if (!helper.merge(obj)) {
            return helper.fail();
        }
        if (context.scores) {
            helper.addErrors();
            return helper.succeed();
        } else {
            return helper.succeed({
                scores: obj.data
            } as EntityContext);
        }
    },
    sort: (reader, _, context) => {
        const helper = new ReturnHelper();

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
            }
        }
        if (context.sort) {
            helper.addErrors();
            return helper.succeed();
        }
        return helper.succeed({
            sort: res.data as string
        } as EntityContext);
    },
    tag: (reader, _, context) => {
        const helper = new ReturnHelper();

        const negated = isNegated(reader, helper);

        const tag = reader.readUnquotedString();
        if (
            context.tags &&
            context.tags.indexOf(`${negated ? "!" : ""}${tag}`) !== -1
        ) {
            helper.addErrors();
            return helper.succeed();
        }
        if (
            context.tags &&
            (tag === "" && negated
                ? context.tags.length === 0
                : context.tags.length !== 0)
        ) {
            helper.addErrors();
            return helper.succeed();
        }
        return helper.succeed({
            tags: [...(context.tags || []), `${negated ? "!" : ""}${tag}`]
        });
    },
    team: (reader, info, context) => {
        const helper = new ReturnHelper();

        const negated = isNegated(reader, helper);

        if (info.data.localData && info.data.localData.nbt.scoreboard) {
            const teamnames = info.data.localData.nbt.scoreboard.data.Teams.map(
                v => v.Name
            );
            const res = reader.readOption([...teamnames, ""], {
                quote: false,
                unquoted: StringReader.charAllowedInUnquotedString
            });
            if (!helper.merge(res)) {
                if (res.data) {
                    return helper.succeed();
                } else {
                    return helper.fail();
                }
            }

            const teams = negated
                ? teamnames.filter(v => v !== res.data)
                : res.data === ""
                    ? []
                    : [res.data];

            if (
                context.team &&
                context.team.every(v => teams.indexOf(v) !== -1)
            ) {
                // Duplicate
                helper.addErrors();
                return helper.succeed();
            }

            const intTypes: string[] = context.team
                ? context.team.filter(v => teams.indexOf(v) !== -1)
                : teams;

            if (intTypes.length === 0) {
                helper.addErrors();
                return helper.succeed();
            } else {
                return helper.succeed({
                    team: intTypes
                } as EntityContext);
            }
        } else {
            const team = reader.readUnquotedString();
            if (team === "") {
                return helper.fail();
            } else {
                return helper.succeed(negated ? undefined : { team: [team] });
            }
        }
    },
    type: (reader, info, context) => {
        const helper = new ReturnHelper();

        const negated = isNegated(reader, helper);

        const ltype = parseNamespaceOrTag(reader, info, "entity_tags");
        if (!helper.merge(ltype)) {
            return helper.fail();
        }

        const literalType = ltype.data.resolved || [ltype.data.parsed];

        const types = nsEntity.filter(
            v => negated === literalType.some(f => namespacesEqual(f, v))
        );

        if (
            context.type &&
            context.type.every(v =>
                types.some(f => namespacesEqual(f, convertToNamespace(v)))
            )
        ) {
            // Duplicate
            helper.addErrors();
            return helper.succeed();
        }

        const intTypes: string[] = [];

        if (context.type) {
            for (const type of context.type) {
                if (types.some(v => v === convertToNamespace(type))) {
                    intTypes.push(type);
                }
            }
        } else {
            types.forEach(v =>
                intTypes.push(`${v.namespace || "minecraft"}:${v.path}`)
            );
        }

        if (intTypes.length === 0) {
            helper.addErrors();
            return helper.succeed();
        } else {
            return helper.succeed({
                type: intTypes
            } as EntityContext);
        }
    },
    x: intOptParser(-3e7, 3e7 - 1, "x"),
    x_rotation: rangeOptParser(true, JAVAMININT, JAVAMAXINT, "x_rotation"),
    y: intOptParser(0, 255, "y"),
    y_rotation: rangeOptParser(true, JAVAMININT, JAVAMAXINT, "y_rotation"),
    z: intOptParser(-3e7, 3e7 - 1, "z")
};

export class EntityBase implements Parser {
    private readonly fakePlayer: boolean;

    public constructor(fakePlayer: boolean) {
        this.fakePlayer = fakePlayer;
    }

    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<ContextChange> {
        const helper = new ReturnHelper();
        if (
            helper.merge(reader.expect("@"), {
                errors: false
            })
        ) {
            const start = reader.cursor;
            const context: EntityContext = {};
            const exp = reader.expectOption("p", "a", "r", "s", "e");
            if (!helper.merge(exp)) {
                return helper.fail();
            }
            switch (exp.data) {
                case "p":
                    context.limit = 1;
                    context.type = ["minecraft:player"];
                    break;
                case "a":
                    context.type = ["minecraft:player"];
                    break;
                case "r":
                    context.limit = 1;
                    context.type = ["minecraft:player"];
                    break;
                case "s":
                    context.limit = 1;
                    break;
                case "e":
                    break;
                default:
                    throw new TypeError();
            }
            if (reader.canRead() && reader.peek() === "[") {
                let next = reader.read();
                while (next !== "]") {
                    const arg = reader.readUnquotedString();
                    if (!helper.merge(reader.expect("="))) {
                        return helper.fail();
                    }
                    const opt = options[arg];

                    const conc = opt(reader, info, context);
                    if (!helper.merge(conc)) {
                        return helper.fail();
                    }
                    if (conc.data) {
                        Object.assign(context, conc.data);
                    }
                    const nextc = reader.expectOption(",", "]");
                    if (!helper.merge(nextc)) {
                        return helper.fail();
                    }
                    next = nextc.data;
                }
            }
            const conterr = getContextError(
                context,
                info.node_properties as NodeProp
            );
            if (conterr) {
                return helper.fail(conterr.create(start, reader.cursor));
            }
            return helper.succeed();
        } else if (uuidregex.test(reader.getRemaining().substr(0, 36))) {
            helper.addErrors(
                uuidwarn.create(reader.cursor, reader.cursor + 36)
            );
            reader.cursor += 36;
            /*
            const conterr = getContextError(
                {
                    ...info.context,
                    limit: 1
                },
                info.node_properties as NodeProp
            );
            if (conterr) {
                return helper.fail(
                    conterr.create(reader.cursor - 36, reader.cursor)
                );
            }
            */
            return helper.succeed();
        } else if (this.fakePlayer) {
            if (info.data.localData && info.data.localData.nbt.scoreboard) {
                for (const score of info.data.localData.nbt.scoreboard.data
                    .PlayerScores) {
                    if (reader.getRemaining().startsWith(score.Name)) {
                        helper.addSuggestion(reader.cursor, score.Name);
                    }
                }
            }
            reader.readWhileRegexp(/[^\s]/);
            return helper.succeed();
        }
        const name = reader.readUnquotedString();
        if (name === "") {
            return helper.fail();
        }
        return helper.succeed({
            entity: "minecraft:player",
            isSingle: true
        } as ContextChange);
    }
}

export const entity = new EntityBase(false);
export const scoreHolder = new EntityBase(true);
