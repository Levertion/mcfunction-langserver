import { CommandErrorBuilder } from "../../../brigadier_components/errors";
import { StringReader } from "../../../brigadier_components/string_reader";
import { ReturnHelper } from "../../../misc_functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../../types";

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
                return helper.fail(
                    INCOMPLETE.create(
                        start,
                        reader.cursor,
                        i + 1,
                        this.rules.count
                    )
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
                    if (!reader.canRead()) {
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
                        break;
                    }
                    hasWorld = true;
                    if (!helper.merge(this.parseNumber(reader, false))) {
                        return helper.fail();
                    }
                    if (hasLocal) {
                        helper.addErrors(MIXED.create(cstart, reader.cursor));
                    }
            }
            if (
                (!reader.canRead() || !helper.merge(reader.expect(" "))) &&
                i < this.rules.count - 1
            ) {
                return helper.fail(
                    INCOMPLETE.create(
                        start,
                        reader.cursor,
                        i + 1,
                        this.rules.count
                    )
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
