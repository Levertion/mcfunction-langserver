import { ListNode } from "mc-nbt-paths";

import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { emptyRange } from "../../../../test/blanks";
import { LineRange, ReturnSuccess } from "../../../../types";
import { NodeInfo } from "../util/doc-walker-util";
import { Correctness, LIST_START } from "../util/nbt-util";
import { NBTWalker } from "../walker";

import { BaseList } from "./lists";
import { ParseReturn } from "./nbt-tag";

export class NBTTagList extends BaseList {
    public tagType: "list" = "list";
    // The open square bracket
    protected start: LineRange = emptyRange();

    public validate(
        anyInfo: NodeInfo,
        walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        const result = this.sameType(anyInfo);
        if (!helper.merge(result)) {
            return helper.succeed();
        }
        const info = anyInfo as NodeInfo<ListNode>;
        helper.merge(this.validateWith(info, walker.getItem(info), walker));
        return helper.succeed();
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        if (!helper.merge(reader.expect(LIST_START))) {
            return helper.failWithData(Correctness.NO);
        }
        reader.skipWhitespace();
        this.start = { start, end: reader.cursor };
        const result = this.parseInner(reader);
        if (helper.merge(result)) {
            return helper.succeed(Correctness.CERTAIN);
        } else {
            return helper.failWithData(Correctness.CERTAIN);
        }
    }
}
