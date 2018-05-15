import { CommandErrorBuilder, isCommandError } from "../../../brigadier_components/errors";
import { StringReader } from "../../../brigadier_components/string_reader";
import { HighlightScope } from "../../../highlight/highlight_util";
import { Parser, ParseResult } from "../../../types";
import { NBTWalker } from "./nbt/doc_walker";
import { NBTTagCompound } from "./nbt/tag/compound_tag";

const COMPACC = ".";
const ARROPEN = "[";
const ARRCLOSE = "]";

const badChar = new CommandErrorBuilder("argument.nbt_path.badchar", "Bad character '%s'");

interface PathReturn {
    path: string[];
    highlight: HighlightScope[];
}

function getPath(reader: StringReader): PathReturn {
    const out: string[] = [];
    const highlight: HighlightScope[] = [];
    const start = reader.cursor;
    out.push(reader.readString());
    while (reader.canRead() && !/\s/.test(reader.peek())) {
        const next = reader.read();
        if (next === COMPACC) {
            highlight.push({
                end: reader.cursor,
                scopes: ["value-separator", "separator"],
                start: reader.cursor - 1,
            });
            const sstart = reader.cursor;
            const quot = reader.peek() === "\"";
            out.push(reader.readString());
            highlight.push({
                end: reader.cursor,
                scopes: ["value", "string", quot ? "quoted" : "unquoted"],
                start: sstart,
            });
        } else if (next === ARROPEN) {
            out.push(reader.readInt().toString());
            reader.expect(ARRCLOSE);
        } else {
            throw badChar.create(reader.cursor - 1, reader.cursor, next);
        }
    }
    highlight.push({
        end: reader.cursor,
        scopes: ["argument", "minecraft:nbt_path"],
        start,
    });
    return {
        highlight,
        path: out,
    };
}

export class NBTPathParser implements Parser {
    public parse(reader: StringReader): ParseResult {
        const out = getPath(reader);
        return {
            highlight: out.highlight,
            successful: true,
        };
    }

    public getSuggestions(text: string) {
        let path: string[] = [];
        try {
            path = getPath(new StringReader(text)).path;
        } catch (e) {
            if (isCommandError(e)) {
                //
            } else {
                return [];
            }
        }
        const walker = new NBTWalker(new NBTTagCompound({}));
        // @ts-ignore
        const node = walker.getFinalNode(path);
        if (node === undefined) {
            return [];
        }
        return [];
    }
}
