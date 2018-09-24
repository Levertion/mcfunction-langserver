import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { CorrectLevel, parseIntNBT } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export const SHORT_TAG_SUFFIX = "s";

export class NBTTagShort extends NBTTag<number> {
    public tagType: "short" = "short";

    protected readTag(reader: StringReader): ParseReturn {
        const readInt = parseIntNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(SHORT_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        this.val = readInt.data;
        return helper.succeed(CorrectLevel.YES);
    }
}
