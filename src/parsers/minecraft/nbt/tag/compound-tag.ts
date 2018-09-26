import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { LineRange, ReturnedInfo } from "../../../../types";
import { parseTag } from "../tag-parser";
import {
    isCompoundNode,
    NBTNode,
    NBTValidationInfo,
    VALIDATION_ERRORS
} from "../util/doc-walker-util";
import {
    COMPOUND_END,
    COMPOUND_KEY_VALUE_SEP,
    COMPOUND_PAIR_SEP,
    COMPOUND_START,
    getHoverText
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

export interface KVPos {
    key: string;
    keyPos: LineRange;
    valPos: LineRange;
}

export class NBTTagCompound extends NBTTag<{ [key: string]: NBTTag<any> }> {
    public tagType: "compound" = "compound";
    private insertKeyPos = 0;

    private kvpos: KVPos[] = [];

    public getKeyPos(): KVPos[] {
        return this.kvpos;
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

    public validationResponse(
        auxnode: NBTNode,
        info: NBTValidationInfo
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        const superResponse = super.validationResponse(auxnode, info);
        if (!helper.merge(superResponse)) {
            return helper.fail();
        }
        if (!isCompoundNode(auxnode)) {
            // Mainly a type guard
            return helper.fail();
        }
        const node = info.compoundMerge();
        for (const k of this.kvpos) {
            if (!info.extraChildren && !(k.key in (node.children || {}))) {
                helper.addErrors(
                    VALIDATION_ERRORS.noSuchChild.create(
                        k.keyPos.start,
                        k.valPos.end,
                        k.key
                    )
                );
            }
            if (
                node.children &&
                k.key in node.children &&
                node.children[k.key].description
            ) {
                helper.addActions({
                    data: getHoverText(node.children[k.key]),
                    high: k.keyPos.end,
                    low: k.keyPos.start,
                    type: "hover"
                });
            }
        }
        if (node.children) {
            for (const c of Object.keys(node.children)) {
                helper.addSuggestion(
                    this.insertKeyPos,
                    c,
                    undefined,
                    node.children[c].description
                );
            }
        }
        return helper.succeed();
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const compStart = reader.expect(COMPOUND_START);
        if (!helper.merge(compStart)) {
            return helper.failWithData({ correct: 0, parsed: this });
        }
        if (!reader.canRead()) {
            this.insertKeyPos = reader.cursor;
            helper.addSuggestion(reader.cursor, COMPOUND_END);
            helper.addErrors(NO_KEY.create(start, reader.cursor));
            return helper.failWithData({ parsed: this, correct: 2 });
        }
        if (reader.peek() === COMPOUND_END) {
            reader.skip();
            return helper.succeed(2);
        }
        let next = reader.peek();
        const keys = [];
        this.kvpos = [];
        while (next !== COMPOUND_END) {
            reader.skipWhitespace();

            this.insertKeyPos = reader.cursor;

            if (!reader.canRead()) {
                helper.addErrors(NO_KEY.create(start, reader.cursor));
                return helper.failWithData({
                    correct: 2,
                    parsed: this,
                    path: []
                });
            }
            const keyS = reader.cursor;
            const key = reader.readString();
            if (!helper.merge(key)) {
                return helper.failWithData({
                    correct: 2,
                    parsed: this,
                    path: []
                });
            }
            const keyE = reader.cursor;
            keys.push(key.data);

            reader.skipWhitespace();

            const kvs = reader.expect(COMPOUND_KEY_VALUE_SEP);
            if (!helper.merge(kvs)) {
                this.kvpos.push({
                    key: key.data,
                    keyPos: { start: keyS, end: keyE },
                    valPos: { start: reader.cursor, end: reader.cursor }
                });
                return helper.failWithData({
                    correct: 2,
                    parsed: this,
                    path: [key.data]
                });
            }

            reader.skipWhitespace();

            if (!reader.canRead()) {
                this.kvpos.push({
                    key: key.data,
                    keyPos: { start: keyS, end: keyE },
                    valPos: { start: reader.cursor, end: reader.cursor }
                });
                helper.addErrors(NO_VAL.create(keyS, reader.cursor));
                return helper.failWithData({
                    correct: 2,
                    parsed: this,
                    path: [key.data]
                });
            }

            const valS = reader.cursor;

            let val: NBTTag<any>;
            const pkey = parseTag(reader);

            this.kvpos.push({
                key: key.data,
                keyPos: { start: keyS, end: keyE },
                valPos: { start: valS, end: reader.cursor }
            });

            if (helper.merge(pkey)) {
                val = pkey.data;
            } else {
                const path = [key.data, ...(pkey.data.path || [])];
                if (pkey.data.parsed) {
                    this.val[key.data] = pkey.data.parsed;
                }
                return helper.failWithData({
                    correct: 2,
                    parsed: this,
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
                return helper.failWithData({
                    correct: 2,
                    parsed: this,
                    path: [key.data]
                });
            } else {
                next = opt.data;
            }
        }
        return helper.succeed(2);
    }
}
