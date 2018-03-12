import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { parseTag } from "../tag_parser";
import { NBTError } from "../util/nbt_error";
import { NBTHoverAction, throwIfFalse, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

const MIXED = new CommandErrorBuilder("argument.nbt.list.mixed", "Mixed value types");
const NOVAL = new CommandErrorBuilder("argument.nbt.list.noval", "Expected ']'");
const EXCLOSE = new CommandErrorBuilder("argument.nbt.list.notclosed", "Expected ',' or ']'");

export const LIST_OPEN = "[";
export const LIST_CLOSE = "]";
export const VAL_SEP = ",";

export class NBTTagList extends NBTTag<Array<NBTTag<any>>> {

    public tagType: "list" = "list";

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

    public _parse(reader: StringReader): void {
        const start = reader.cursor;
        tryWithData(() => reader.expect(LIST_OPEN), {}, 0);
        let type: NBTTag<any>;
        let next = "";
        while (next !== LIST_CLOSE) {

            reader.skipWhitespace();

            let value: NBTTag<any>;

            throwIfFalse(
                reader.canRead(),
                NOVAL.create(start, reader.cursor),
                { parsed: this, completions: [LIST_CLOSE] },
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
            if (next !== VAL_SEP && next !== LIST_CLOSE) {
                throw new NBTError(
                    EXCLOSE.create(start, reader.cursor),
                    { parsed: this, completions: [LIST_CLOSE, VAL_SEP] },
                    1,
                );
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
