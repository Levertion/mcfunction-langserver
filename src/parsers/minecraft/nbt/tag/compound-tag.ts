import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { ReturnedInfo } from "../../../../types";
import { parseTag } from "../tag-parser";
import {
    COMPOUND_END,
    COMPOUND_KEY_VALUE_SEP,
    COMPOUND_PAIR_SEP,
    COMPOUND_START,
    NBTErrorData
} from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

const NO_KEY = new CommandErrorBuilder(
    "argument.nbt.compound.nokey",
    "Expected key"
);
const NO_VAL = new CommandErrorBuilder(
    "argument.nbt.compound.noval",
    "Expected value"
);

export class NBTTagCompound extends NBTTag<{ [key: string]: NBTTag<any> }> {
    public tagType: "compound" = "compound";

    private readonly keyPos: number[][] = [];

    public parse(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const compStart = reader.expect(COMPOUND_START);
        if (!helper.merge(compStart)) {
            return helper.failWithData({ correct: 0, parsed: this });
        }
        let next = COMPOUND_START;
        const keys = [];
        while (next !== COMPOUND_END) {
            reader.skipWhitespace();

            if (!reader.canRead()) {
                helper.addErrors(NO_KEY.create(start, reader.cursor));
                return helper.failWithData({
                    correct: 2,
                    keys,
                    parsed: this,
                    part: "key" as "key",
                    path: []
                });
            }
            const keyS = reader.cursor;
            const key = reader.readString();
            if (!helper.merge(key)) {
                return helper.failWithData({
                    correct: 2,
                    keys,
                    parsed: this,
                    part: "key" as "key",
                    path: []
                });
            }
            keys.push(key.data);
            this.keyPos.push([keyS, reader.cursor]);

            reader.skipWhitespace();

            const kvs = reader.expect(COMPOUND_KEY_VALUE_SEP);
            if (!helper.merge(kvs)) {
                return helper.failWithData({
                    correct: 2,
                    keys,
                    parsed: this,
                    part: "key" as "key",
                    path: [key.data]
                });
            }

            reader.skipWhitespace();

            if (!reader.canRead()) {
                helper.addErrors(NO_VAL.create(keyS, reader.cursor));
                return helper.failWithData({
                    correct: 2,
                    keys,
                    parsed: this,
                    part: "value" as "value",
                    path: [key.data]
                });
            }

            let val: NBTTag<any>;
            const pkey = parseTag(reader);

            if (
                helper.merge(pkey as ReturnedInfo<NBTTag<any> | NBTErrorData>)
            ) {
                val = pkey.data as NBTTag<any>;
            } else {
                const path = [
                    key.data,
                    ...((pkey.data as NBTErrorData).path || [])
                ];
                return helper.failWithData({
                    correct: 2,
                    keys,
                    parsed: this,
                    part: "value" as "value",
                    path
                });
            }

            reader.skipWhitespace();

            this.val[key.data] = val;

            reader.skipWhitespace();

            const opt = reader.readOption(
                [COMPOUND_END, COMPOUND_PAIR_SEP],
                true,
                undefined,
                "option"
            );
            if (!helper.merge(opt)) {
                return helper.failWithData({ parsed: this, correct: 2 });
            } else {
                next = opt.data;
            }
        }
        return helper.succeed(2);
    }

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        return (
            Object.keys(this.val).length === Object.keys(tag.getVal()).length &&
            Object.keys(this.val).every(v =>
                this.val[v].tagEq((tag as NBTTagCompound).val[v])
            )
        );
    }
}
