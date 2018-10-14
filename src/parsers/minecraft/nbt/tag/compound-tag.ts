import { NBTNode, NoPropertyNode } from "mc-nbt-paths";
import { __values } from "tslib";
import {
    CommandError,
    CommandErrorBuilder
} from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { CE, LineRange, ReturnedInfo, ReturnSuccess } from "../../../../types";
import { parseAnyNBTTag } from "../tag-parser";
import {
    isCompoundInfo,
    isCompoundNode,
    isTypedInfo,
    NBTValidationInfo,
    NodeInfo,
    VALIDATION_ERRORS
} from "../util/doc-walker-util";
import {
    COMPOUND_END,
    COMPOUND_KEY_VALUE_SEP,
    COMPOUND_PAIR_SEP,
    COMPOUND_START,
    Correctness,
    createSuggestions,
    getHoverText,
    getNBTSuggestions,
    NBTErrorData
} from "../util/nbt-util";
import { NBTWalker } from "../walker";
import { NBTTag, ParseReturn } from "./nbt-tag";

const NO_KEY = new CommandErrorBuilder(
    "argument.nbt.compound.nokey",
    "Expected key"
);
const NO_VAL = new CommandErrorBuilder(
    "argument.nbt.compound.noval",
    "Expected value"
);

export interface KVPair {
    /** The position the last part was closed at */
    closeIdx?: number | false;
    key?: string;
    keyRange: LineRange;
    value?: NBTTag;
}

export interface UnknownsError extends CommandError {
    path: string[];
}

export class NBTTagCompound extends NBTTag {
    public tagType: "compound" = "compound";
    private openIndex = -1;
    /**
     * If empty => no values, closed instantly (e.g. `{}`, `{ }`)
     * If last has no key => no key straight after the `{` or `,`
     * (with spaces) or key could not be parsed (e.g. `{"no-close-quote`)
     * If last has key but no closed, then it is the last item (e.g. `{"key"`,{key)
     * If last has key but closed, it has been unparseable either due to an invalid
     * character after or within the strin
     */
    private parts: KVPair[] = [];
    private value: Map<string, NBTTag> = new Map();

    public validate(
        node: NodeInfo,
        walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        let stop = false;
        if (!this.opens) {
            stop = true;
            createSuggestions(node.node, this.openIndex);
        }
        const result = this.sameType(node);
        if (!helper.merge(result)) {
            stop = true;
            return helper.succeed();
        }
        return helper.succeed();
    }

    public valideAgainst(
        auxnode: NBTNode,
        info: NBTValidationInfo
    ): ReturnedInfo<undefined, UnknownsError | CE> {
        const helper = new ReturnHelper();
        // Const superResponse = super.valideAgainst(auxnode, info);
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
        if (!helper.merge(reader.expect(COMPOUND_START))) {
            return helper.failWithData(Correctness.NO);
        }
        this.openIndex = start;
        reader.skipWhitespace();
        if (reader.peek() === COMPOUND_END) {
            reader.skip();
            return helper.succeed(Correctness.CERTAIN);
        }
        reader.cursor = start; // This improves the value of the first kvstart in case of `{  `
        while (true) {
            const kvstart = reader.cursor;
            reader.skipWhitespace();
            const keyStart = reader.cursor;
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, COMPOUND_END);
                helper.addErrors(NO_KEY.create(kvstart, reader.cursor));
                this.parts.push({
                    keyRange: {
                        end: reader.cursor,
                        start: reader.cursor
                    }
                });
                return helper.failWithData(Correctness.CERTAIN);
            }
            const key = reader.readString();
            const keyEnd = reader.cursor;
            if (!helper.merge(key)) {
                const keypart: KVPair = {
                    key: key.data,
                    keyRange: {
                        end: reader.cursor,
                        start: keyStart
                    }
                };
                if (reader.canRead()) {
                    keypart.closeIdx = false;
                }
                this.parts.push(keypart);
                return helper.failWithData(Correctness.CERTAIN);
            }
            reader.skipWhitespace();
            if (!reader.canRead()) {
                this.parts.push({
                    key: key.data,
                    keyRange: {
                        end: keyEnd,
                        start: keyStart
                    }
                });
                helper.addErrors(NO_VAL.create(keyStart, reader.cursor));
                return helper
                    .addSuggestion(reader.cursor, COMPOUND_KEY_VALUE_SEP)
                    .failWithData(Correctness.CERTAIN);
            }
            const kvs = reader.expect(COMPOUND_KEY_VALUE_SEP);

            if (!helper.merge(kvs)) {
                // E.g. '{"hello",' etc.
                this.parts.push({
                    closeIdx: false,
                    key: key.data,
                    keyRange: {
                        end: keyEnd,
                        start: keyStart
                    }
                });
                return helper.failWithData(Correctness.CERTAIN);
            }
            const afterSep = reader.cursor;
            reader.skipWhitespace();
            if (!reader.canRead()) {
                this.parts.push({
                    closeIdx: afterSep,
                    key: key.data,
                    keyRange: { start: keyStart, end: keyEnd }
                });
                helper.addErrors(NO_VAL.create(keyStart, reader.cursor));
                return helper.failWithData(Correctness.CERTAIN);
            }
            const valResult = parseAnyNBTTag(reader);
            const part: KVPair = {
                key: key.data,
                keyRange: { start: keyStart, end: keyEnd },
                value: valResult.data && valResult.data.tag
            };
            if (!helper.merge(valResult)) {
                this.parts.push(part);
                return helper.failWithData(Correctness.CERTAIN);
            }
            reader.skipWhitespace();
            this.value.set(key.data, valResult.data.tag);
            if (reader.peek() === COMPOUND_PAIR_SEP) {
                reader.skip();
                part.closeIdx = reader.cursor;
                this.parts.push(part);
                continue;
            }
            if (reader.peek() === COMPOUND_END) {
                reader.skip();
                part.closeIdx = reader.cursor;
                this.parts.push(part);
                break;
            }
            return helper.failWithData(Correctness.CERTAIN);
        }
        return helper.succeed(Correctness.CERTAIN);
    }
}
