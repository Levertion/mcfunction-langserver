import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { LineRange, ReturnedInfo, ReturnSuccess } from "../../../../types";
import { parseAnyNBTTag } from "../tag-parser";
import { NodeInfo } from "../util/doc-walker-util";
import {
    getHoverText,
    getNBTSuggestions,
    LIST_END,
    LIST_VALUE_SEP
} from "../util/nbt-util";
import { NBTWalker } from "../walker";
import { NBTTag } from "./nbt-tag";

const NOVAL = new CommandErrorBuilder(
    "argument.nbt.list.noval",
    "Expected ']'"
);

export abstract class BaseList extends NBTTag {
    protected end: LineRange | undefined;
    protected abstract start: LineRange;
    protected unclosed: number | undefined;
    protected values: NBTTag[] = [];

    public parseInner(reader: StringReader): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (reader.peek() === LIST_END) {
            reader.skip();
            return helper.succeed();
        }
        const tags: NBTTag[] = [];

        let index = 0;
        while (true) {
            this.unclosed = reader.cursor;
            const start = reader.cursor;
            reader.skipWhitespace();
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, LIST_END);
                helper.addErrors(NOVAL.create(start, reader.cursor));
                return helper.fail();
            }
            const value = parseAnyNBTTag(reader, [
                ...this.path,
                `[${index++}]`
            ]);
            if (helper.merge(value)) {
                tags.push(value.data.tag);
            } else {
                return helper.fail();
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
                this.end = { start: preEnd, end: reader.cursor };
                return helper.succeed();
            }
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, LIST_END);
                helper.addSuggestion(reader.cursor, LIST_VALUE_SEP);
            }
            return helper.fail(NOVAL.create(preEnd, reader.cursor));
        }
    }

    public validateWith(
        node: NodeInfo,
        children: NodeInfo,
        walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        helper.addActions({
            data: getHoverText(node.node),
            high: this.start.end,
            low: this.start.start,
            type: "hover"
        });
        for (const value of this.values) {
            helper.merge(value.validate(children, walker));
        }
        if (typeof this.unclosed === "number") {
            helper.merge(getNBTSuggestions(children.node, this.unclosed));
        }
        if (this.end) {
            helper.addActions({
                data: getHoverText(node.node),
                high: this.start.end,
                low: this.start.start,
                type: "hover"
            });
        }
        return helper.succeed();
    }
}
