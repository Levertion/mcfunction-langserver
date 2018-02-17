import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
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

export class NBTTagInt extends NBTTag {

    protected tagType: "int" = "int";

    private val: NBTTag[];

    constructor(val: NBTTag[] = []) {
        super();
        this.val = val;
    }

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader): void {
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
            } else if (type.getTagType() !== value.getTagType()) {
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
