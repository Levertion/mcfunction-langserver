import { CommandErrorBuilder } from "../../../brigadier/errors";
import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../../types";

export class ListParser implements Parser {
    private readonly err: CommandErrorBuilder;
    private readonly id: string;

    public constructor(id: string, err: CommandErrorBuilder) {
        this.id = id;
        this.err = err;
    }

    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<undefined> {
        const start = reader.cursor;
        const opts = info.data.globalData.static_lists.getList(this.id);
        const helper = new ReturnHelper(info);
        const opteval = reader.readOption(opts, false, undefined, "no");
        if (helper.merge(opteval)) {
            return helper.succeed();
        } else {
            return helper.fail(
                this.err.create(start, reader.cursor, opteval.data)
            );
        }
    }
}
