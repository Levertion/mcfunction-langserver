import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness, parseFloatNBT } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export const DOUBLE_TAG_SUFFIX = "d";

export class NBTTagDouble extends NBTTag {
    public tagType: "double" = "double";

    protected readTag(reader: StringReader): ParseReturn {
        const readInt = parseFloatNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(DOUBLE_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        this.value = readInt.data;
        return helper.succeed(Correctness.CERTAIN);
    }
}
