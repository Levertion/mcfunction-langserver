import { CommandErrorBuilder } from "../../../brigadier_components/errors";
import { StringReader } from "../../../brigadier_components/string_reader";
import { GlobalData } from "../../../data/types";
import { ReturnHelper } from "../../../misc_functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../../types";

export class ListParser implements Parser {
    private readonly err: CommandErrorBuilder;
    private readonly opts: (data: GlobalData) => string[];

    public constructor(
        opts: (data: GlobalData) => string[],
        err: CommandErrorBuilder
    ) {
        this.opts = opts;
        this.err = err;
    }

    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<undefined> {
        const start = reader.cursor;
        const opts = this.opts(info.data.globalData);
        const helper = new ReturnHelper(info);
        const opteval = reader.readOption(opts, false);
        if (helper.merge(opteval)) {
            return helper.succeed();
        } else {
            return helper.fail(this.err.create(start, reader.cursor));
        }
    }
}
