import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness, parseIntNBT } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export const BYTE_TAG_SUFFIX = "b";

export class NBTTagByte extends NBTTag<number> {
    public tagType: "byte" = "byte";

    protected readTag(reader: StringReader): ParseReturn {
        const readInt = parseIntNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(BYTE_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        this.value = readInt.data;
        return helper.succeed(Correctness.CERTAIN);
    }
}
