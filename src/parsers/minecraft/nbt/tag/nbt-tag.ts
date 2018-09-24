import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { CE, LineRange, ReturnedInfo, Suggestion } from "../../../../types";
import { runSuggestFunction } from "../doc-walker-func";
import {
    isTypedNode,
    NBTNode,
    NBTValidationInfo,
    VALIDATION_ERRORS
} from "../util/doc-walker-util";
import { CorrectLevel, NBTErrorData } from "../util/nbt-util";

export type ParseReturn = ReturnedInfo<CorrectLevel, CE, NBTErrorData>;

export type TagType =
    | "byte"
    | "short"
    | "int"
    | "long"
    | "float"
    | "double"
    | "byte_array"
    | "int_array"
    | "long_array"
    | "string"
    | "list"
    | "compound";

export abstract class NBTTag<L> {
    public abstract readonly tagType: TagType;
    protected range: LineRange;

    protected val: L;

    public constructor(val: L) {
        this.val = val;
        this.range = { start: 0, end: 0 };
    }

    public getRange(): LineRange {
        return this.range;
    }

    public getVal(): L {
        return this.val;
    }

    public parse(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        const out = this.readTag(reader);
        this.range = {
            end: reader.cursor,
            start
        };
        return out;
    }

    /**
     * Test if two NBT tags are equivalent in value
     * @param tag The NBT tag to test against
     */
    public tagEq(tag: NBTTag<any>): boolean {
        return tag.tagType === this.tagType && tag.getVal() === this.getVal();
    }

    public validationResponse(
        node: NBTNode,
        // @ts-ignore
        info?: NBTValidationInfo
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (!isTypedNode(node)) {
            return helper.fail(
                VALIDATION_ERRORS.wrongType.create(
                    this.range.start,
                    this.range.end,
                    "",
                    this.tagType
                )
            );
        } else if (node.type !== this.tagType) {
            return helper.fail(
                VALIDATION_ERRORS.wrongType.create(
                    this.range.start,
                    this.range.end,
                    node.type,
                    this.tagType
                )
            );
        } else {
            if (node.suggestions) {
                for (const k of node.suggestions) {
                    if (typeof k === "string") {
                        helper.addSuggestion(this.range.start, k);
                    } else if ("function" in k) {
                        helper.addSuggestions(
                            ...runSuggestFunction(
                                k.function.id,
                                k.function.params
                            ).map<Suggestion>(v => ({
                                start: this.range.start,
                                text: v
                            }))
                        );
                    } else {
                        helper.addSuggestion(
                            this.range.start,
                            k.value,
                            undefined,
                            k.description
                        );
                    }
                }
            }
            return helper.succeed();
        }
    }

    protected abstract readTag(reader: StringReader): ParseReturn;
}
