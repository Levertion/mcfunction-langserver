import { CommandErrorBuilder } from "../../../brigadier_components/errors";
import { StringReader } from "../../../brigadier_components/string_reader";
import { ReturnHelper } from "../../../misc_functions";
import { Parser, ReturnedInfo } from "../../../types";

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

export class CoordBaseParser implements Parser {
    private rules: CoordRules;

    public constructor(rules: CoordRules) {
        this.rules = rules;
    }

    public parse(reader: StringReader): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        let hasLocal = false;
        let hasWorld = false;
        const start = reader.cursor;
        for (let i = 0; i < this.rules.count; i++) {
            switch (reader.peek()) {
                case "~":
                    if (hasLocal) {
                        return helper.fail(
                            MIXED.create(reader.cursor, reader.cursor + 1)
                        );
                    }
                    hasWorld = true;
                    reader.skip();
                    if (!helper.merge(this.parseNumber(reader))) {
                        return helper.fail();
                    }
                    break;
                case "^":
                    if (hasWorld) {
                        return helper.fail(
                            MIXED.create(reader.cursor, reader.cursor + 1)
                        );
                    }
                    if (!this.rules.local) {
                        return helper.fail(
                            NO_LOCAL.create(reader.cursor, reader.cursor + 1)
                        );
                    }
                    hasLocal = true;
                    reader.skip();
                    if (!helper.merge(this.parseNumber(reader))) {
                        return helper.fail();
                    }
                    break;
                default:
                    if (hasLocal) {
                        return helper.fail(
                            MIXED.create(reader.cursor, reader.cursor + 1)
                        );
                    }
                    if (!reader.canRead()) {
                        helper.addSuggestions(
                            {
                                start: reader.cursor,
                                text: "~"
                            },
                            {
                                start: reader.cursor,
                                text: "^"
                            }
                        );
                    }
                    hasWorld = true;
                    if (!helper.merge(this.parseNumber(reader))) {
                        return helper.fail();
                    }
            }
            if (
                !reader.canRead() ||
                (!helper.merge(reader.expect(" ")) && i < this.rules.count - 1)
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
            reader.skip();
        }
        return helper.succeed();
    }

    private parseNumber(reader: StringReader): ReturnedInfo<number> {
        return this.rules.float ? reader.readFloat() : reader.readInt();
    }
}

interface CoordRules {
    count: 2 | 3;
    float: boolean;
    local: boolean;
}