import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { parseTag } from "../tag_parser";
import { NBTError } from "../util/nbt_error";
import {
    expectAndScope,
    LIST_END,
    LIST_START,
    LIST_VALUE_SEP,
    NBTHighlightAction,
    NBTHoverAction,
    scopeChar,
    throwIfFalse,
} from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

const MIXED = new CommandErrorBuilder("argument.nbt.list.mixed", "Mixed value types");
const NOVAL = new CommandErrorBuilder("argument.nbt.list.noval", "Expected ']'");
const EXCLOSE = new CommandErrorBuilder("argument.nbt.list.notclosed", "Expected ',' or ']'");

export class NBTTagList extends NBTTag<Array<NBTTag<any>>> {

    public tagType: "list" = "list";

    private scopes: NBTHighlightAction[] = [];

    public getHover(): NBTHoverAction[] {
        const val: NBTHoverAction[] = [
            {
                data: this.val[0] === undefined ? "" : this.val[0].tagType,
                end: this.end,
                start: this.start,
            },
        ];
        this.val.forEach(
            (v, i) => val.push(...v.getHover().map(
                (v1) => ({
                    data: v1.data,
                    end: v1.end,
                    path: [i.toString(), ...(v1.path || [])],
                    start: v1.start,
                } as NBTHoverAction),
            )),
        );
        return val;
    }

    public getHighlight() {
        return this.scopes.concat({
            end: this.end,
            scopes: ["list"],
            start: this.start,
        });
    }

    public _parse(reader: StringReader): void {
        const start = reader.cursor;
        this.scopes.push(expectAndScope(reader, LIST_START, ["list-start", "start"], {}, 0));
        let type: NBTTag<any>;
        let next = "";
        while (next !== LIST_END) {

            reader.skipWhitespace();

            let value: NBTTag<any>;

            throwIfFalse(
                reader.canRead(),
                NOVAL.create(start, reader.cursor),
                { parsed: this, completions: [LIST_END] },
                2,
            );

            reader.skipWhitespace();

            try {
                value = parseTag(reader);
            } catch (e) {
                const ex = e as NBTError;
                throw ex.create(
                    {
                        parsed: this,
                        path: [this.val.length.toString(), ...(ex.data.path || [])],
                    },
                    true,
                    2,
                );
            }

            this.val.push(value);

            // @ts-ignore
            if (type === undefined) {
                type = value;
            } else if (type.tagType !== value.tagType) {
                throw new NBTError(MIXED.create(start, reader.cursor), { parsed: this }, 2);
            }

            reader.skipWhitespace();

            next = reader.read();
            if (next !== LIST_VALUE_SEP && next !== LIST_END) {
                throw new NBTError(
                    EXCLOSE.create(start, reader.cursor),
                    { parsed: this, completions: [LIST_END, LIST_VALUE_SEP] },
                    1,
                );
            }
            if (next === LIST_VALUE_SEP) {
                this.scopes.push(scopeChar(reader.cursor, ["value-separator", "separator"]));
            }
        }
        this.correct = 2;
    }

    public tagEq(tag: NBTTag<any>): boolean {
        if (tag.tagType !== this.tagType) {
            return false;
        }
        return this.val.length === (tag as NBTTagList).val.length && this.val.every(
            (v, i) => v.tagEq((tag as NBTTagList).getVal()[i]),
        );
    }
}
