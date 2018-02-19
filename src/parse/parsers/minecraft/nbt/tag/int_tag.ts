import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { parseIntNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagInt extends NBTTag<number> {

    public tagType: "int" = "int";

    public getActions() {
        return [];
    }

    public _parse(reader: StringReader): void {
        try {
            this.val = parseIntNBT(reader);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 1;
    }
}
