import { CommandErrorBuilder } from "../../../../brigadier_components/errors";
import { StringReader } from "../../../../brigadier_components/string_reader";
import { actionFromScope, actionFromScopes } from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import { ReturnedInfo } from "../../../../types";
import { parseTag } from "../tag_parser";
import {
    COMPOUND_END,
    COMPOUND_KEY_VALUE_SEP,
    COMPOUND_PAIR_SEP,
    COMPOUND_START,
    NBTErrorData,
    scopeChar,
} from "../util/nbt_util";
import { NBTTag, ParseReturn } from "./nbt_tag";

const NO_KEY = new CommandErrorBuilder("argument.nbt.compound.nokey", "Expected key");
const NO_VAL = new CommandErrorBuilder("argument.nbt.compound.noval", "Expected value");

export class NBTTagCompound extends NBTTag<{ [key: string]: NBTTag<any> }> {

    public tagType: "compound" = "compound";

    private keyPos: number[][] = [];

    public parse(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        const helper = new ReturnHelper();
        const compStart = reader.expect(COMPOUND_START);
        if (!helper.merge(compStart)) {
            return helper.failWithData({ correct: 0, parsed: this });
        }
        helper.addActions(actionFromScope(scopeChar(reader.cursor, ["compound-start", "start"])));
        let next = reader.peek();
        const keys = [];
        while (next !== COMPOUND_END) {

            reader.skipWhitespace();

            if (!reader.canRead()) {
                helper.addErrors(NO_KEY.create(reader.cursor, reader.cursor));
                return helper.failWithData(
                    { correct: 2, keys, part: "key" as "key", path: [], parsed: this },
                );
            }
            const keyS = reader.cursor;
            const quoted = reader.peek() === "\"";
            const key = reader.readString();
            if (!helper.merge(key)) {
                return helper.failWithData(
                    { correct: 2, keys, part: "key" as "key", path: [], parsed: this },
                );
            }
            keys.push(key.data);
            this.keyPos.push([keyS, reader.cursor]);

            helper.addActions(actionFromScope({
                end: reader.cursor,
                scopes: ["string", quoted ? "quoted" : "unquoted", "key"],
                start: keyS,
            }));

            if (quoted) {
                helper.addActions(...actionFromScopes(
                    [{
                        end: keyS + 1,
                        scopes: ["string-start", "start"],
                        start: keyS,
                    },
                    {
                        end: reader.cursor,
                        scopes: ["string-end", "end"],
                        start: reader.cursor - 1,
                    }],
                ));
            }

            reader.skipWhitespace();

            const kvs = reader.expect(COMPOUND_KEY_VALUE_SEP);
            if (!helper.merge(kvs)) {
                return helper.failWithData(
                    { correct: 2, keys, part: "key" as "key", path: [key.data], parsed: this },
                );
            }
            helper.addActions(actionFromScope(scopeChar(
                reader.cursor,
                ["compound", "key-value", "separator"],
            )));

            reader.skipWhitespace();

            if (!reader.canRead()) {
                helper.addErrors(NO_VAL.create(reader.cursor, reader.cursor));
                helper.failWithData(
                    { correct: 2, keys, part: "value", path: [key], parsed: this },
                );
            }

            let val: NBTTag<any>;
            const pkey = parseTag(reader);

            if (helper.merge(pkey as ReturnedInfo<NBTTag<any> | NBTErrorData>)) {
                val = pkey.data as NBTTag<any>;
            } else {
                const path = [key.data, ...((pkey.data as NBTErrorData).path || [])];
                return helper.failWithData(
                    { parsed: this, keys, part: "value" as "value", path, correct: 2 },
                );
            }

            reader.skipWhitespace();

            this.val[key.data] = val;

            reader.skipWhitespace();

            const opt = reader.readOption([COMPOUND_END, COMPOUND_PAIR_SEP]);
            if (!helper.merge(opt)) {
                return helper.failWithData({ parsed: this, correct: 2 });
            } else {
                next = opt.data;
            }
        }
        helper.addActions(actionFromScope(scopeChar(reader.cursor, ["compound-end", "end"])));
        helper.addActions(actionFromScope({
            end: reader.cursor,
            scopes: ["compound"],
            start,
        }));
        if (helper.hasErrors()) {
            return helper.failWithData({ parsed: this, correct: 2 });
        }
        return helper.succeed(2);
    }

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        return Object.keys(this.val).length === Object.keys(tag.getVal()).length && Object.keys(this.val).every(
            (v) => this.val[v].tagEq(((tag as NBTTagCompound).val)[v]),
        );
    }
}
