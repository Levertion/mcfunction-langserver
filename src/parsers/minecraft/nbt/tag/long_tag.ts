import { StringReader } from "../../../../brigadier_components/string_reader";
import { actionFromScope, ReturnHelper } from "../../../../misc_functions";
import { CorrectLevel, parseIntNBT, scopeChar } from "../util/nbt_util";
import { NBTTag, ParseReturn } from "./nbt_tag";

export const LONG_TAG_SUFFIX = "l";

export class NBTTagLong extends NBTTag<number> {
    public tagType: "long" = "long";

    public parse(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        const readInt = parseIntNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        const exp = reader.expect(LONG_TAG_SUFFIX);
        if (!helper.merge(exp)) {
            return helper.failWithData({ correct: 0 });
        }
        helper.addActions(
            actionFromScope({
                end: reader.cursor,
                scopes: ["long"],
                start
            }),
            actionFromScope(scopeChar(reader.cursor, ["suffix"]))
        );
        this.val = readInt.data;
        return helper.succeed(CorrectLevel.YES);
    }
}
