import { NBTNode, NoPropertyNode } from "mc-nbt-paths";
import {
    BlankCommandError,
    fillBlankError
} from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { fillBlanks, ReturnHelper } from "../../../../misc-functions";
import {
    CE,
    LineRange,
    ReturnedInfo,
    ReturnSuccess,
    SubAction
} from "../../../../types";
import {
    isTypedInfo,
    isTypedNode,
    NodeInfo,
    VALIDATION_ERRORS
} from "../util/doc-walker-util";
import { Correctness, getHoverText } from "../util/nbt-util";
import { NBTWalker } from "../walker";

export const emptyRange: LineRange = { start: 0, end: 0 };
export type ParseReturn = ReturnedInfo<Correctness, CE, Correctness>;
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

export abstract class NBTTag {
    protected path: string[];
    protected range: LineRange = emptyRange;
    protected abstract tagType: TagType;

    public constructor(path: string[]) {
        this.path = path;
    }
    public getRange(): LineRange {
        return this.range;
    }

    public parse(reader: StringReader): ParseReturn {
        this.range.start = reader.cursor;
        const out = this.readTag(reader);
        this.range.end = reader.cursor;
        // tslint:disable:helper-return
        return out;
    }

    public validate(
        node: NodeInfo,
        // tslint:disable-next-line:variable-name
        _walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        const result = this.sameType(node);
        if (!helper.merge(result)) {
            return helper.succeed();
        }
        helper.addActions(this.rangeHover(node.node));
        return helper.succeed();
    }

    protected rangeHover(
        node: NBTNode,
        range: LineRange = this.range
    ): SubAction {
        return {
            data: getHoverText(node),
            high: range.end,
            low: range.start,
            type: "hover"
        };
    }

    protected abstract readTag(reader: StringReader): ParseReturn;

    protected sameType(
        node: NodeInfo,
        type: TagType = this.tagType
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (!isTypedInfo(node) || (node.node as NoPropertyNode).type !== type) {
            return helper.fail(
                VALIDATION_ERRORS.wrongType.create(
                    this.range.start,
                    this.range.end,
                    (node.node as NoPropertyNode).type || "",
                    type
                )
            );
        }
        return helper.succeed();
    }
}
