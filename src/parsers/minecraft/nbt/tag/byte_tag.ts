import { StringReader } from "../../../../brigadier_components/string_reader";
import { ReturnHelper } from "../../../../misc_functions";
import { CorrectLevel, parseIntNBT } from "../util/nbt_util";
import { NBTTag, ParseReturn } from "./nbt_tag";

export const BYTE_TAG_SUFFIX = "b";

export class NBTTagByte extends NBTTag<number> {
    public tagType: "byte" = "byte";

    public parse(reader: StringReader): ParseReturn {
        const readInt = parseIntNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(BYTE_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        this.val = readInt.data;
        return helper.succeed(CorrectLevel.YES);
    }
}
