import { StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { Correctness, parseIntNBT } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

export class NBTTagInt extends NBTTag {
    public tagType: "int" = "int";

    protected readTag(reader: StringReader): ParseReturn {
        const readInt = parseIntNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        this.value = readInt.data;
        return helper.succeed(Correctness.CERTAIN);
    }
}
