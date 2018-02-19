import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTError } from "../util/nbt_error";
import { parseIntNBT } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const SHORT_TAG_SUFFIX = "s";

export class NBTTagShort extends NBTTag<number> {

    public tagType: "short" = "short";

    public getActions() {
        return [];
    }

    public _parse(reader: StringReader): void {
        try {
            this.val = parseIntNBT(reader);
            reader.expect(SHORT_TAG_SUFFIX);
        } catch (e) {
            throw new NBTError(e);
        }
        this.correct = 2;
    }
}
