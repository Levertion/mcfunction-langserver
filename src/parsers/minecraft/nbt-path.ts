import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ReturnHelper } from "../../misc-functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../types";
import { NBTWalker } from "./nbt/doc-walker";
import { NBTTagCompound } from "./nbt/tag/compound-tag";
import { getNBTSuggestions } from "./nbt/util/nbt-util";

const COMPACC = ".";
const ARROPEN = "[";
const ARRCLOSE = "]";

const badChar = new CommandErrorBuilder(
    "argument.nbt_path.badchar",
    "Bad character '%s'"
);

export const parser: Parser = {
    parse: (
        reader: StringReader,
        prop: ParserInfo
    ): ReturnedInfo<undefined> => {
        const helper = new ReturnHelper();
        const out: string[] = [];
        const walker = new NBTWalker(
            new NBTTagCompound({}),
            prop.data.globalData.nbt_docs
        );
        const chr = reader.readString();
        if (helper.merge(chr)) {
            out.push(chr.data);
        } else {
            const node = walker.getFinalNode([]);
            if (!!node) {
                helper.mergeChain(getNBTSuggestions(node, reader.cursor));
            }
        }
        while (reader.canRead() && !/\s/.test(reader.peek())) {
            const next = reader.read();
            if (next === COMPACC) {
                const str = reader.readString();
                if (helper.merge(str)) {
                    out.push(str.data);
                } else {
                    const node = walker.getFinalNode([]);
                    if (!!node) {
                        helper.mergeChain(
                            getNBTSuggestions(node, reader.cursor)
                        );
                    }
                }
            } else if (next === ARROPEN) {
                const num = reader.readInt();
                if (helper.merge(num)) {
                    out.push(num.data.toString());
                } else {
                    const node = walker.getFinalNode([]);
                    if (!!node) {
                        helper.mergeChain(
                            getNBTSuggestions(node, reader.cursor)
                        );
                    }
                }
                if (!helper.merge(reader.expect(ARRCLOSE))) {
                    return helper.fail();
                }
            } else {
                return helper.fail(
                    badChar.create(reader.cursor - 1, reader.cursor, next)
                );
            }
        }
        helper.addSuggestion(reader.cursor, ".");
        helper.addSuggestion(reader.cursor, "[");
        return helper.succeed();
    }
};
