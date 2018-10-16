import { NoPropertyNode } from "mc-nbt-paths";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { CE, LineRange, ReturnedInfo, ReturnSuccess } from "../../../../types";
import {
    isTypedInfo,
    NodeInfo,
    VALIDATION_ERRORS
} from "../util/doc-walker-util";
import { Correctness } from "../util/nbt-util";
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
    public abstract tagType: TagType;
    protected path: string[];
    protected range: LineRange = emptyRange;

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

    public abstract validate(
        node: NodeInfo,
        walker: NBTWalker
    ): ReturnSuccess<undefined>;

    protected abstract readTag(reader: StringReader): ParseReturn;

    protected sameType(
        node: NodeInfo,
        type: TagType = this.tagType
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (!isTypedInfo(node) || (node.node as NoPropertyNode).type === type) {
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

    protected suggestions(
        start: number,
        startText: string,
        node: NodeInfo,
        walker: NBTWalker
    ) {}
}
/*  public valideAgainst(
        node: NBTNode,
        // tslint:disable-next-line:variable-name _starting names is the only way to disable unused variable warnings
        _info?: NBTValidationInfo
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
        }
        if (node.description) {
            helper.addActions({
                data: getHoverText(node),
                high: this.range.end,
                low: this.range.start,
                type: "hover"
            });
        }
        return helper.succeed();
    } */
