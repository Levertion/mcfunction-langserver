import { DiagnosticSeverity } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { QUOTE, StringReader } from "../../brigadier/string-reader";
import { JAVAMAXINT } from "../../consts";
import { entities } from "../../data/lists/statics";
import {
    convertToNamespace,
    namespacesEqual,
    parseNamespaceOrTag,
    ReturnHelper,
    stringArrayEqual
} from "../../misc-functions";
import { ContextChange, Parser, ParserInfo, ReturnedInfo } from "../../types";
import { nbtParser } from "./nbt/nbt";
import { MCRange, rangeParser } from "./range";

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
    dx?: number;
    dy?: number;
    dz?: number;
    limit?: number;
    names?: string[];
    tags?: string[];
    team?: string[];
    type?: string[];
    x?: number;
    xp?: MCRange;
    y?: number;
    z?: number;
}

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

const getContextError = (cont: EntityContext, prop: NodeProp) => {
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
};

type OptionParser = (
    reader: StringReader,
    info: ParserInfo,
    context: EntityContext
) => ReturnedInfo<EntityContext | undefined>;

// tslint:disable-next-line:no-unnecessary-callback-wrapper it gives an error if it isn't wrapped
const nsEntity = entities.map(v => convertToNamespace(v));

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

const intRangeOptParser = (
    min: number,
    max: number,
    key: keyof EntityContext
) => (reader: StringReader, _: ParserInfo, context: EntityContext) => {
    const helper = new ReturnHelper();
    const res = rangeParser(false)(reader);

    if (!helper.merge(res)) {
        return helper.fail();
    }

    const range = res.data;

    if (range.max > max || range.max < min) {
        helper.addErrors();
        return helper.succeed();
    }
    if (range.min > max || range.min < min) {
        helper.addErrors();
        return helper.succeed();
    }
    if (!!context[key]) {
        helper.addErrors();
        return helper.succeed();
    }
    const out: EntityContext = {};
    out[key] = range;
    return helper.succeed(out);
};

const options: { [key: string]: OptionParser } = {
    dx: intOptParser(-3e7, 3e7 - 1, "dx"),
    dy: intOptParser(-3e7, 3e7 - 1, "dy"),
    dz: intOptParser(-3e7, 3e7 - 1, "dz"),
    limit: intOptParser(1, JAVAMAXINT, "limit"),
    name: (reader, _, context) => {
        const helper = new ReturnHelper();
        const negated = reader.peek() === "!";
        if (negated) {
            reader.skip();
        }
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
        const res = nbtParser.parse(reader, info);
        if (!helper.merge(res)) {
            return helper.fail();
        } else {
            return helper.succeed();
        }
    },
    tag: (reader, _, context) => {
        const helper = new ReturnHelper();
        const negated = reader.peek() === "!";
        if (negated) {
            reader.skip();
        }
        const tag = reader.readUnquotedString();
        if (tag === "") {
            return helper.fail();
        }
        if (
            context.tags &&
            context.tags.indexOf(`${negated ? "!" : ""}${tag}`) !== -1
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
        const negated = reader.peek() === "!";
        if (negated) {
            reader.skip();
        }
        if (info.data.localData && info.data.localData.nbt.scoreboard) {
            const teamnames = info.data.localData.nbt.scoreboard.data.Teams.map(
                v => v.Name
            );
            const res = reader.readOption(
                teamnames,
                StringReader.charAllowedInUnquotedString
            );
            if (!helper.merge(res)) {
                if (res.data) {
                    return helper.succeed();
                } else {
                    return helper.fail();
                }
            }

            const teams = negated
                ? teamnames.filter(v => v !== res.data)
                : [res.data];

            if (
                context.type &&
                context.type.every(v => teams.indexOf(v) !== -1)
            ) {
                // Duplicate
                helper.addErrors();
                return helper.succeed();
            }

            const intTypes: string[] = context.team
                ? context.team.filter(v => teams.indexOf(v) !== -1)
                : teams;

            if (intTypes.length === 0) {
                return helper.fail();
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
        const negated = reader.peek() === "!";
        if (negated) {
            reader.skip();
        }
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
            return helper.fail();
        } else {
            return helper.succeed({
                type: intTypes
            } as EntityContext);
        }
    },
    x: intOptParser(-3e7, 3e7 - 1, "x"),
    xp: intRangeOptParser(0, JAVAMAXINT, "xp"),
    y: intOptParser(0, 255, "y"),
    z: intOptParser(-3e7, 3e7 - 1, "z")
};

export class EntityBase implements Parser {
    private readonly fakePlayer: boolean;

    public constructor(fakePlayer: boolean) {
        this.fakePlayer = fakePlayer;
    }

    // tslint:disable:cyclomatic-complexity
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
