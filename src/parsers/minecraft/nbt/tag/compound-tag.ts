import { CompoundNode, NBTNode } from "mc-nbt-paths";
import { __values } from "tslib";
import { CompletionItemKind } from "vscode-languageserver";
import {
    CommandError,
    CommandErrorBuilder
} from "../../../../brigadier/errors";
import {
    quoteIfNeeded,
    StringReader
} from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { LineRange, ReturnSuccess, SubAction } from "../../../../types";
import { parseAnyNBTTag } from "../tag-parser";
import { NodeInfo } from "../util/doc-walker-util";
import {
    COMPOUND_END,
    COMPOUND_KEY_VALUE_SEP,
    COMPOUND_PAIR_SEP,
    COMPOUND_START,
    Correctness,
    createSuggestions,
    getHoverText,
    getStartSuggestion
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
    closeIdx?: number;
    key?: string;
    keyRange: LineRange;
    value?: NBTTag;
}

const UNKNOWN = new CommandErrorBuilder(
    "argument.nbt.compound.unknown",
    "Unknown child '%s'"
);
const DUPLICATE = new CommandErrorBuilder(
    "argument.nbt.compound.duplicate",
    "'%s' is already defined"
);
const UNCLOSED = new CommandErrorBuilder(
    "argument.nbt.compound.unclosed",
    "Compound is not closed, expected `}`"
);

export interface UnknownsError extends CommandError {
    path: string[];
}

/**
 * TODO: refactor (again)!
 * Help welcome
 */
export class NBTTagCompound extends NBTTag {
    protected tagType: "compound" = "compound";
    protected value: Map<string, NBTTag> = new Map();
    private openIndex = -1;
    /**
     * If empty => no values, closed instantly (e.g. `{}`, `{ }`)
     * If last has no key => no key straight after the `{` or `,`
     * (with spaces) or key could not be parsed (e.g. `{"no-close-quote`)
     * If last has key but no closed, then it is the last item (e.g. `{"key"`,{key)
     * If last has key but closed, it has been unparseable either due to an invalid
     * character after or within the strin
     */
    private readonly parts: KVPair[] = [];

    public getValue(): Map<string, NBTTag> {
        return this.value;
    }

    public setValue(val: Map<string, NBTTag>): this {
        this.value = val;
        return this;
    }

    public validate(
        anyInfo: NodeInfo,
        walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        if (this.openIndex === -1) {
            // This should never happen
            createSuggestions(anyInfo.node, this.range.end);
            return helper.succeed();
        }
        const result = this.sameType(anyInfo);
        if (!helper.merge(result)) {
            return helper.succeed();
        }
        const info = anyInfo as NodeInfo<CompoundNode>;
        const hoverText = getHoverText(anyInfo.node);
        if (this.parts.length === 0) {
            helper.addActions({
                // Add the hover over the entire object
                data: hoverText,
                high: this.range.end,
                low: this.openIndex,
                type: "hover"
            });
            return helper.succeed();
        }
        helper.addActions({
            // Add hover to the open `{`
            data: hoverText,
            high: this.openIndex + 1,
            low: this.openIndex,
            type: "hover"
        });
        const children = walker.getChildren(info);
        for (let index = 0; index < this.parts.length; index++) {
            const part = this.parts[index];
            const final = index === this.parts.length - 1;
            if (part.key) {
                if (part.value) {
                    const child = children[part.key];
                    if (child) {
                        helper.merge(part.value.validate(child, walker));
                        helper.addActions(
                            getKeyHover(part.keyRange, child.node)
                        );
                    } else {
                        const error: UnknownsError = {
                            ...UNKNOWN.create(
                                part.keyRange.start,
                                part.keyRange.end,
                                part.key
                            ),
                            path: [...this.path, part.key]
                        };
                        helper.addErrors(error);
                    }
                } else {
                    helper.merge(handleNoValue(part));
                }
            } else {
                helper.merge(handleNoValue(part));
            }
            if (final && part.value && typeof part.closeIdx === "number") {
                helper.addActions({
                    // Add hover to the close `}`
                    data: hoverText,
                    high: part.closeIdx,
                    low: part.closeIdx - 1,
                    type: "hover"
                });
            }
        }
        return helper.succeed();
        function handleNoValue(part: KVPair): ReturnSuccess<undefined> {
            const keyHelper = new ReturnHelper();
            const key = part.key || "";
            if (part.closeIdx === undefined) {
                for (const childName of Object.keys(children)) {
                    if (childName.startsWith(key)) {
                        const thisChild = children[childName];
                        const text =
                            thisChild && getStartSuggestion(thisChild.node);
                        keyHelper.addSuggestions({
                            description: getHoverText(children[childName].node),
                            kind: CompletionItemKind.Field,
                            label: childName,
                            start: part.keyRange.start,
                            text:
                                quoteIfNeeded(childName) +
                                (text ? `: ${text}` : "")
                        });
                    }
                }
            }
            const child = children[key];
            if (child) {
                // Not sure what this would have ever done, feels like a bug
                /* if (part.closeIdx && part.closeIdx >= 0) {
                    keyHelper.merge(
                        getNBTSuggestions(child.node, part.closeIdx)
                    ); 
                }*/
                keyHelper.addActions(getKeyHover(part.keyRange, child.node));
            }
            // tslint:disable-next-line:helper-return
            return keyHelper.succeed();
        }
        function getKeyHover(range: LineRange, child: NBTNode): SubAction {
            return {
                data: getHoverText(child),
                high: range.end,
                low: range.start,
                type: "hover"
            };
        }
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        if (!helper.merge(reader.expect(COMPOUND_START))) {
            return helper.failWithData(Correctness.NO);
        }
        this.openIndex = start;
        reader.skipWhitespace();
        if (helper.merge(reader.expect(COMPOUND_END), { errors: false })) {
            return helper.succeed(Correctness.CERTAIN);
        }
        while (true) {
            reader.skipWhitespace();
            const kvstart = reader.cursor;
            const keyStart = reader.cursor;
            if (!reader.canRead()) {
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
                    keyRange: { end: keyEnd, start: keyStart }
                };
                if (reader.canRead()) {
                    // Support suggesting for an unclosed quoted string otherwise
                    keypart.closeIdx = reader.cursor;
                    // I'm not sure that this does anything :P
                }
                this.parts.push(keypart);
                return helper.failWithData(Correctness.CERTAIN);
            }
            reader.skipWhitespace();
            if (this.value.has(key.data)) {
                helper.addErrors(DUPLICATE.create(keyStart, keyEnd, key.data));
            }
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

            if (!helper.merge(reader.expect(COMPOUND_KEY_VALUE_SEP))) {
                // E.g. '{"hello",' etc.
                this.parts.push({
                    closeIdx: -1,
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
            const valResult = parseAnyNBTTag(reader, [...this.path, key.data]);
            const part: KVPair = {
                key: key.data,
                keyRange: { start: keyStart, end: keyEnd },
                value: valResult.data && valResult.data.tag
            };
            if (!helper.merge(valResult)) {
                this.parts.push(part);
                return helper.failWithData(Correctness.CERTAIN);
            }
            const preEnd = reader.cursor;
            reader.skipWhitespace();
            this.value.set(key.data, valResult.data.tag);
            if (
                helper.merge(reader.expect(COMPOUND_PAIR_SEP), {
                    errors: false
                })
            ) {
                part.closeIdx = reader.cursor;
                this.parts.push(part);
                continue;
            } else if (
                helper.merge(reader.expect(COMPOUND_END), {
                    errors: false
                })
            ) {
                part.closeIdx = reader.cursor;
                this.parts.push(part);
                return helper.succeed(Correctness.CERTAIN);
            }
            this.parts.push(part);
            helper.addErrors(UNCLOSED.create(preEnd, reader.cursor));
            return helper.failWithData(Correctness.CERTAIN);
        }
    }
}
