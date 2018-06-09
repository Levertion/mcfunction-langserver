import { StringReader } from "../../../../brigadier_components/string_reader";
import { actionFromScope } from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import { CorrectLevel, parseIntNBT } from "../util/nbt_util";
import { NBTTag, ParseReturn } from "./nbt_tag";

export class NBTTagInt extends NBTTag<number> {
    public tagType: "int" = "int";

    public parse(reader: StringReader): ParseReturn {
        const start = reader.cursor;
        const readInt = parseIntNBT(reader);
        const helper = new ReturnHelper();
        if (!helper.merge(readInt)) {
            return helper.failWithData({ correct: 0 });
        }
        helper.addActions(
            actionFromScope({
                end: reader.cursor,
                scopes: ["int"],
                start
            })
        );
        this.val = readInt.data;
        return helper.succeed(CorrectLevel.YES);
    }
}
