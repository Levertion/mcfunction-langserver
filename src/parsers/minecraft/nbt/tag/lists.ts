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

    public getValue(): NBTTag[] {
        return this.values;
    }

    public parseInner(reader: StringReader): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (helper.merge(reader.expect(LIST_END), { errors: false })) {
            return helper.succeed();
        }
        let index = 0;
        while (true) {
            this.unclosed = reader.cursor;
            const start = reader.cursor;
            reader.skipWhitespace();
            if (!reader.canRead()) {
                helper.addErrors(NOVAL.create(start, reader.cursor));
                return helper.fail();
            }
            const value = parseAnyNBTTag(reader, [
                ...this.path,
                `[${index++}]`
            ]);
            if (helper.merge(value)) {
                this.values.push(value.data.tag);
            } else {
                if (value.data) {
                    this.values.push(value.data.tag);
                    this.unclosed = undefined;
                }
                return helper.fail();
            }
            this.unclosed = undefined;
            const preEnd = reader.cursor;
            reader.skipWhitespace();
            if (
                helper.merge(reader.expect(LIST_VALUE_SEP), { errors: false })
            ) {
                continue;
            }
            if (helper.merge(reader.expect(LIST_END), { errors: false })) {
                this.end = { start: preEnd, end: reader.cursor };
                return helper.succeed();
            }
            return helper.fail(NOVAL.create(preEnd, reader.cursor));
        }
    }

    public setValue(val: NBTTag[]): this {
        this.values = val;
        return this;
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
