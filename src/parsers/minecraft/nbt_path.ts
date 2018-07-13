import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { StringReader } from "../../brigadier_components/string_reader";
import { ReturnHelper } from "../../misc_functions";
import { Parser, ParserInfo, ReturnedInfo } from "../../types";
import { NBTWalker } from "./nbt/doc_walker";
import { NBTTagCompound } from "./nbt/tag/compound_tag";
import { addSuggestionsToHelper } from "./nbt/util/nbt_util";

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
            prop.data.globalData.doc_fs
        );
        const chr = reader.readString();
        if (helper.merge(chr)) {
            out.push(chr.data);
        } else {
            const node = walker.getFinalNode([]);
            if (!!node) {
                addSuggestionsToHelper(node, helper, reader);
            }
        }
        while (
            !helper.hasErrors() &&
            reader.canRead() &&
            !/\s/.test(reader.peek())
        ) {
            const next = reader.read();
            if (next === COMPACC) {
                const str = reader.readString();
                if (helper.merge(str)) {
                    out.push(str.data);
                } else {
                    const node = walker.getFinalNode([]);
                    if (!!node) {
                        addSuggestionsToHelper(node, helper, reader);
                    }
                }
            } else if (next === ARROPEN) {
                const num = reader.readInt();
                if (helper.merge(num)) {
                    out.push(num.data.toString());
                } else {
                    const node = walker.getFinalNode([]);
                    if (!!node) {
                        addSuggestionsToHelper(node, helper, reader);
                    }
                }
                helper.merge(reader.expect(ARRCLOSE));
            } else {
                helper.addErrors(
                    badChar.create(reader.cursor - 1, reader.cursor, next)
                );
            }
        }
        if (!helper.hasErrors()) {
            helper.addSuggestion(reader.cursor, ".");
            helper.addSuggestion(reader.cursor, "[");
        }
        return helper.hasErrors() ? helper.fail() : helper.succeed();
    }
};
