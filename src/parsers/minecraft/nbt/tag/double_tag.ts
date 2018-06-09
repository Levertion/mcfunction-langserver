import { StringReader } from "../../../../brigadier_components/string_reader";
import { actionFromScope } from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import { CorrectLevel, parseFloatNBT, scopeChar } from "../util/nbt_util";
import { NBTTag, ParseReturn } from "./nbt_tag";

export const DOUBLE_TAG_SUFFIX = "d";

export class NBTTagDouble extends NBTTag<number> {
    public tagType: "double" = "double";

    public parse(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        const readInt = parseFloatNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(DOUBLE_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        helper.addActions(
            actionFromScope({
                end: reader.cursor,
                scopes: ["double"],
                start
            }),
            actionFromScope(scopeChar(reader.cursor, ["suffix"]))
        );
        this.val = readInt.data;
        return helper.succeed(CorrectLevel.YES);
    }
}
