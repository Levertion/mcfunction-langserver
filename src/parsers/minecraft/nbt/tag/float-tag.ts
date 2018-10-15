import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness, parseFloatNBT } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export const FLOAT_TAG_SUFFIX = "f";

export class NBTTagFloat extends NBTTag {
    public tagType: "float" = "float";

    protected readTag(reader: StringReader): ParseReturn {
        const readInt = parseFloatNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(FLOAT_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        this.value = readInt.data;
        return helper.succeed(Correctness.CERTAIN);
    }
}
