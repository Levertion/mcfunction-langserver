import { CommandErrorBuilder } from "../../brigadier_components/errors";
import { StringReader } from "../../brigadier_components/string_reader";
import { HighlightScope } from "../../highlight/highlight_util";
import { actionFromScopes } from "../../highlight/highlight_util";
import { ReturnHelper, returnSwitch } from "../../misc_functions";
import { Parser, ReturnedInfo } from "../../types";
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

export class NBTPathParser implements Parser {
    public parse(reader: StringReader): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        const out: string[] = [];
        const highlight: HighlightScope[] = [];
        const start = reader.cursor;
        const walker = new NBTWalker(new NBTTagCompound({}));
        returnSwitch(
            reader.readString(),
            v => {
                out.push(v.data);
                helper.merge(v);
            },
            v => {
                helper.merge(v);
                const node = walker.getFinalNode([]);
                if (!!node) {
                    addSuggestionsToHelper(node, helper, reader);
                }
            }
        );
        while (
            !helper.hasErrors() &&
            reader.canRead() &&
            !/\s/.test(reader.peek())
        ) {
            const next = reader.read();
            if (next === COMPACC) {
                highlight.push({
                    end: reader.cursor,
                    scopes: ["value-separator", "separator"],
                    start: reader.cursor - 1
                });
                const sstart = reader.cursor;
                const quot = reader.peek() === '"';
                returnSwitch(
                    reader.readString(),
                    v => {
                        out.push(v.data);
                        helper.merge(v);
                    },
                    v => {
                        helper.merge(v);
                        const node = walker.getFinalNode([]);
                        if (!!node) {
                            addSuggestionsToHelper(node, helper, reader);
                        }
                    }
                );
                highlight.push({
                    end: reader.cursor,
                    scopes: ["value", "string", quot ? "quoted" : "unquoted"],
                    start: sstart
                });
            } else if (next === ARROPEN) {
                returnSwitch(
                    reader.readInt(),
                    v => {
                        out.push(v.data.toString());
                        helper.merge(v);
                    },
                    v => {
                        helper.merge(v);
                        const node = walker.getFinalNode([]);
                        if (!!node) {
                            addSuggestionsToHelper(node, helper, reader);
                        }
                    }
                );
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
        highlight.push({
            end: reader.cursor,
            scopes: ["argument", "minecraft:nbt_path"],
            start
        });
        helper.addActions(...actionFromScopes(highlight));
        return helper.addErrors() ? helper.fail() : helper.succeed();
    }
}
