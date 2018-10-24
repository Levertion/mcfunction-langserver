import { NoPropertyNode } from "mc-nbt-paths";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { emptyRange } from "../../../../test/blanks";
import { LineRange, ReturnSuccess } from "../../../../types";
import { NodeInfo } from "../util/doc-walker-util";
import { Correctness } from "../util/nbt-util";
import { NBTWalker } from "../walker";
import { BaseList } from "./lists";
import { ParseReturn } from "./nbt-tag";

type ArrayType = "byte_array" | "int_array" | "long_array";
const types: Array<["B" | "I" | "L", "byte" | "int" | "long", ArrayType]> = [
    ["B", "byte", "byte_array"],
    ["I", "int", "int_array"],
    ["L", "long", "long_array"]
];

export class NBTTagTypedList extends BaseList {
    protected start: LineRange = emptyRange;
    protected tagType: ArrayType | undefined = undefined;
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
