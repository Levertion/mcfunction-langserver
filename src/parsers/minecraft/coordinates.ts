import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../types";

const MIXED = new CommandErrorBuilder(
    "argument.pos.mixed",
    "Cannot mix world & local coordinates (everything must either use ^ or not)"
);

const INCOMPLETE = new CommandErrorBuilder(
    "argument.pos.incomplete",
    "Incomplete position argument. Only %s coords are present, when %s should be"
);

const NO_LOCAL = new CommandErrorBuilder(
    "argument.pos.nolocal",
    "Local coords are not allowed"
);

const LOCAL = "^";
const RELATIVE = "~";

export interface CoordRules {
    count: 2 | 3;
    float: boolean;
    local: boolean;
}

const fail = (
    reader: StringReader,
    helper: ReturnHelper,
    count: number,
    hasWorld: boolean,
    hasLocal: boolean,
    start: number,
    i: number
) => {
    if (!hasWorld) {
        helper.addSuggestions({
            start: reader.cursor,
            text: LOCAL
        });
    }
    if (!hasLocal) {
        helper.addSuggestions({
            start: reader.cursor,
            text: RELATIVE
        });
    }
    return helper.fail(
        INCOMPLETE.create(
            start,
            reader.cursor,
            (i + 1).toString(),
            count.toString()
        )
    );
};

export class CoordParser implements Parser {
    private readonly rules: CoordRules;

    public constructor(rules: CoordRules) {
        this.rules = rules;
    }

    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper(info);
        let hasLocal = false;
        let hasWorld = false;
        const start = reader.cursor;
        for (let i = 0; i < this.rules.count; i++) {
            if (!reader.canRead()) {
                return fail(
                    reader,
                    helper,
                    this.rules.count,
                    hasWorld,
                    hasLocal,
                    start,
                    0
                );
            }

            const cstart = reader.cursor;
            switch (reader.peek()) {
                case RELATIVE:
                    hasWorld = true;
                    reader.skip();
                    if (!helper.merge(this.parseNumber(reader))) {
                        return helper.fail();
                    }
                    if (hasLocal) {
                        helper.addErrors(MIXED.create(cstart, reader.cursor));
                    }
                    break;
                case LOCAL:
                    if (!this.rules.local) {
                        helper.addErrors(
                            NO_LOCAL.create(reader.cursor, reader.cursor + 1)
                        );
                    }
                    hasLocal = true;
                    reader.skip();
                    if (!helper.merge(this.parseNumber(reader))) {
                        return helper.fail();
                    }
                    if (hasWorld) {
                        helper.addErrors(MIXED.create(cstart, reader.cursor));
                    }
                    break;
                default:
                    hasWorld = true;
                    if (!helper.merge(this.parseNumber(reader, false))) {
                        return helper.fail();
                    }
                    if (hasLocal) {
                        helper.addErrors(MIXED.create(cstart, reader.cursor));
                    }
            }

            if (
                i < this.rules.count - 1 &&
                (!reader.canRead() || !helper.merge(reader.expect(" ")))
            ) {
                return fail(
                    reader,
                    helper,
                    this.rules.count,
                    hasWorld,
                    hasLocal,
                    start,
                    i
                );
            }
        }
        return helper.succeed();
    }

    private parseNumber(
        reader: StringReader,
        allowBlank: boolean = true
    ): ReturnedInfo<number> {
        if ((!reader.canRead() || reader.peek().match(/\s/)) && allowBlank) {
            return new ReturnHelper().succeed(0);
        }
        return this.rules.float ? reader.readFloat() : reader.readInt();
    }
}

export const rotation = new CoordParser({
    count: 2,
    float: true,
    local: false
});

export const vec2 = new CoordParser({
    count: 2,
    float: true,
    local: true
});

export const vec3 = new CoordParser({
    count: 3,
    float: true,
    local: true
});

export const blockPos = new CoordParser({
    count: 3,
    float: false,
    local: true
});
