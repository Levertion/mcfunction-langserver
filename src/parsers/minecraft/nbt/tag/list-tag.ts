import { ListNode } from "mc-nbt-paths";
import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { ReturnSuccess } from "../../../../types";
import { parseAnyNBTTag } from "../tag-parser";
import { NodeInfo } from "../util/doc-walker-util";
import {
    Correctness,
    getNBTSuggestions,
    LIST_END,
    LIST_START,
    LIST_VALUE_SEP
} from "../util/nbt-util";
import { NBTWalker } from "../walker";
import { NBTTag, ParseReturn } from "./nbt-tag";

const NOVAL = new CommandErrorBuilder(
    "argument.nbt.list.noval",
    "Expected ']'"
);

export class NBTTagList extends NBTTag {
    public tagType: "list" = "list";
    private unclosed: number | undefined;
    private values: NBTTag[] = [];
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
        for (const value of this.values) {
            helper.merge(value.validate(NBTWalker.getItem(info), walker));
        }
        if (typeof this.unclosed === "number") {
            helper.merge(getNBTSuggestions(info.node.item, this.unclosed));
        }
        return helper.succeed();
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        if (!helper.merge(reader.expect(LIST_START))) {
            return helper.failWithData(Correctness.NO);
        }
        if (reader.peek() === LIST_END) {
            reader.skip();
            return helper.succeed(Correctness.CERTAIN);
        }
        let index = 0;
        while (true) {
            this.unclosed = reader.cursor;
            const start = reader.cursor;
            reader.skipWhitespace();
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, LIST_END);
                helper.addErrors(NOVAL.create(start, reader.cursor));
                return helper.failWithData(Correctness.MAYBE); // Could be byte array and friends
            }
            const value = parseAnyNBTTag(reader, [
                ...this.path,
                `[${index++}]`
            ]);
            if (helper.merge(value)) {
                this.values.push(value.data.tag);
            } else {
                return helper.failWithData(Correctness.CERTAIN);
            }
            const preEnd = reader.cursor;
            reader.skipWhitespace();
            if (reader.peek() === LIST_VALUE_SEP) {
                reader.skip();
                continue;
            }
            if (reader.peek() === LIST_END) {
                reader.skip();
                this.unclosed = undefined;
                return helper.succeed(Correctness.CERTAIN);
            }
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, LIST_END);
                helper.addSuggestion(reader.cursor, LIST_VALUE_SEP);
            }
            return helper
                .addErrors(NOVAL.create(preEnd, reader.cursor))
                .failWithData(Correctness.CERTAIN);
        }
    }
}
