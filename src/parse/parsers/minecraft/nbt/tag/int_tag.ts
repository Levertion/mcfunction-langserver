import { CommandErrorBuilder } from "../../../../../brigadier_components/errors";
import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { NBTTag } from "./nbt_tag";

const NO_SUFIX = new CommandErrorBuilder("argument.nbt.int.sufix", "Sufix %s after value");

export class NBTTagInt extends NBTTag {

    protected tagType: "int" = "int";

    private val: number = 0;

    public getVal() {
        return this.val;
    }

    public parse(reader: StringReader): void {
        const start = reader.cursor;
        try {
            this.val = reader.readInt();
        } catch (e) {
            throw new NBTError(e);
        }
        if (reader.canRead() && /[bslfd]/.test(reader.peek())) {
            throw new NBTError(NO_SUFIX.create(start, reader.cursor));
        }
    }
}
