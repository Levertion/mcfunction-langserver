import { NoPropertyNode } from "mc-nbt-paths";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { LineRange, ReturnSuccess } from "../../../../types";
import { NodeInfo } from "../util/doc-walker-util";
import { Correctness } from "../util/nbt-util";
import { NBTWalker } from "../walker";
import { BaseList } from "./lists";
import { emptyRange, ParseReturn } from "./nbt-tag";

const types: Array<
    [
        "B" | "I" | "L",
        "byte" | "int" | "long",
        "byte_array" | "int_array" | "long_array"
    ]
> = [
    ["B", "byte", "byte_array"],
    ["I", "int", "int_array"],
    ["L", "long", "long_array"]
];

export class TypedListTag extends BaseList {
    // This should always be overwritten by the time validate is called
    public tagType: "byte_array" | "int_array" | "long_array" = "byte_array";
    protected start: LineRange = emptyRange;
    /** Only used for when we start incorrectly */
    private remaining: string | undefined;
    private startIndex = -1;

    public validate(
        anyInfo: NodeInfo,
        walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        const result = this.sameType(anyInfo);
        if (!helper.merge(result)) {
            return helper.succeed();
        }
        const info = anyInfo as NodeInfo<NoPropertyNode>;
        const type = types.find(
            v => v["2"] === this.tagType /* === info.type */
        );
        if (type) {
            helper.merge(
                this.validateWith(
                    info,
                    { node: { type: type["1"] }, path: info.path },
                    walker
                )
            );
            const toCheck = `[${type["0"]};`;
            if (this.remaining) {
                if (toCheck.startsWith(this.remaining)) {
                    helper.addSuggestion(this.startIndex, toCheck);
                }
            }
        }
        return helper.succeed();
    }

    protected readTag(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        this.startIndex = start;
        const helper = new ReturnHelper();
        const remaining = reader.getRemaining();
        const result = remaining.match(/^\[([BIL]);/);
        if (result) {
            reader.skipWhitespace();
            this.start = { start, end: reader.cursor };
            const type = types.find(v => v[0] === result[1]);
            if (type) {
                this.tagType = type[2];
            } else {
                // `unreachable!`
            }
            const innerResult = this.parseInner(reader);
            if (helper.merge(innerResult)) {
                return helper.succeed(Correctness.CERTAIN);
            } else {
                return helper.failWithData(Correctness.CERTAIN);
            }
        } else {
            this.remaining = remaining;
            return helper.failWithData(Correctness.NO);
        }
    }
}
