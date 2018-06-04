import { StringReader } from "../../../../brigadier_components/string_reader";
import { actionFromScope } from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import { CorrectLevel, parseFloatNBT, scopeChar } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const FLOAT_TAG_SUFFIX = "f";

export class NBTTagFloat extends NBTTag<number> {
    public tagType: "float" = "float";

    public parse(reader: StringReader) {
        const start = reader.cursor;
        const readInt = parseFloatNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(FLOAT_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        helper.addActions(
            actionFromScope({
                end: reader.cursor,
                scopes: ["float"],
                start
            }),
            actionFromScope(scopeChar(reader.cursor, ["suffix"]))
        );
        this.val = readInt.data;
        return helper.succeed(CorrectLevel.YES);
    }
}
