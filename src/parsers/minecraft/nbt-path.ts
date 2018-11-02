import { CompoundNode } from "mc-nbt-paths";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../types";
import {
    isCompoundInfo,
    isListInfo,
    NodeInfo
} from "./nbt/util/doc-walker-util";
import { NBTWalker } from "./nbt/walker";

const DOT = ".";
const ARROPEN = "[";
const ARRCLOSE = "]";

const exceptions = {
    BAD_CHAR: new CommandErrorBuilder(
        "argument.nbt_path.badchar",
        "Bad character '%s'"
    ),
    INCORRECT_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.unknown",
        "Unknown segment '%s'"
    ),
    START_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.array_start",
        "Cannot start an nbt path with an array reference"
    ),
    UNEXPECTED_ARRAY: new CommandErrorBuilder(
        "argument.nbt_path.unknown",
        "Path segment should not be array"
    )
};

export const parser: Parser = {
    parse: (
        reader: StringReader,
        prop: ParserInfo
    ): ReturnedInfo<undefined> => {
        const helper = new ReturnHelper();
        const out: Array<string | number> = [];
        const walker = new NBTWalker(prop.data.globalData.nbt_docs);
        let first = true;
        let current: NodeInfo | undefined = walker.getInitialNode([
            /** Something based on the context data */
        ]);
        while (true) {
            // Whitespace
            const start = reader.cursor;
            if (reader.peek() === ARROPEN) {
                reader.skip();
                const int = reader.readInt();
                if (helper.merge(int)) {
                    out.push(int.data);
                } else {
                    return helper.fail();
                }
                if (!helper.merge(reader.expect(ARRCLOSE))) {
                    return helper.fail();
                }
                if (current) {
                    if (isListInfo(current)) {
                        current = walker.getItem(current);
                    } else {
                        helper.addErrors(
                            exceptions.UNEXPECTED_ARRAY.create(
                                start,
                                reader.cursor
                            )
                        );
                        current = undefined;
                    }
                }
                first = false;
                continue;
            }
            if (reader.peek() === DOT || first) {
                if (reader.peek() === DOT) {
                    reader.skip();
                }
                const children =
                    current && isCompoundInfo(current)
                        ? walker.getChildren(current)
                        : {};
                const res = reader.readOption(Object.keys(children));
                if (helper.merge(res)) {
                    current = walker.getChildWithName(
                        current as NodeInfo<CompoundNode>,
                        res.data
                    );
                } else {
                    if (current && res.data) {
                        helper.addErrors(
                            exceptions.INCORRECT_SEGMENT.create(
                                start,
                                reader.cursor,
                                res.data
                            )
                        );
                    }
                    current = undefined;
                }
                first = false;
                continue;
            }
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, ".");
                helper.addSuggestion(reader.cursor, "[");
            }
            if (/\s/.test(reader.peek())) {
                return helper.succeed();
            }
            return helper.fail(
                exceptions.BAD_CHAR.create(
                    reader.cursor - 1,
                    reader.cursor,
                    reader.peek()
                )
            );
        }

        return helper.succeed();
    }
};
