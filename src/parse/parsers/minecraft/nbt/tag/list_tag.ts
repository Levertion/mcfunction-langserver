import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { SubAction } from "../../../../../types";
import { parseTag } from "../tag_parser";
import { NBTError } from "../util/nbt_error";
import { throwIfFalse, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

const MIXED = new CommandErrorBuilder("argument.nbt.list.mixed", "Mixed value types");
const NOVAL = new CommandErrorBuilder("argument.nbt.list.noval", "Expected ']'");
const EXCLOSE = new CommandErrorBuilder("argument.nbt.list.notclosed", "Expected ',' or ']'");

export const LIST_OPEN = "[";
export const LIST_CLOSE = "]";
export const VAL_SEP = ",";

export class NBTTagList extends NBTTag {

    public tagType: "int" = "int";

    private val: NBTTag[];

    constructor(val: NBTTag[] = []) {
        super();
        this.val = val;
    }

    public getActions(): SubAction[] {
        const val: SubAction[] = [
            {
                data: this.val[0] === undefined ? "" : this.val[0].tagType,
                high: this.end,
                low: this.start,
                type: "hover",
            },
        ];
        this.val.forEach(
            (v) => val.push(...v.getActions()),
        );
        return val;
    }
    public getVal() {
        return this.val;
    }

    public _parse(reader: StringReader): void {
        const start = reader.cursor;
        tryWithData(() => reader.expect(LIST_OPEN), {}, 0);
        let type: NBTTag;
        let next = "";
        while (next !== LIST_CLOSE) {
            let value: NBTTag;

            throwIfFalse(
                reader.canRead(),
                NOVAL.create(start, reader.cursor),
                { parsed: this, completions: [LIST_CLOSE] },
                1,
            );

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
                    1,
                );
            }

            this.val.push(value);

            // @ts-ignore
            if (type === undefined) {
                type = value;
            } else if (type.tagType !== value.tagType) {
                throw new NBTError(MIXED.create(start, reader.cursor), { parsed: this }, 1);
            }

            next = reader.read();
            if (next !== VAL_SEP && next !== LIST_CLOSE) {
                throw new NBTError(
                    EXCLOSE.create(start, reader.cursor),
                    { parsed: this, completions: [LIST_CLOSE, VAL_SEP] },
                    1,
                );
            }
        }
    }
}
