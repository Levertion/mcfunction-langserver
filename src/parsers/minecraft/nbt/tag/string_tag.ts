import { StringReader } from "../../../../brigadier_components/string_reader";
import { actionFromScope } from "../../../../highlight/highlight_util";
import { ReturnHelper } from "../../../../misc_functions";
import { scopeChar } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagString extends NBTTag<string> {
    public tagType: "string" = "string";

    public parse(reader: StringReader) {
        const helper = new ReturnHelper();
        const quoted = reader.canRead() && reader.peek() === "\"";
        const start = reader.cursor;
        const str = reader.readString();
        if (!helper.merge(str)) {
            return helper.failWithData({ correct: 1 });
        } else {
            this.val = str.data;
            helper.addActions(
                actionFromScope({
                    end: reader.cursor,
                    scopes: ["string", quoted ? "quoted" : "unquoted"],
                    start,
                }),
            );
            if (quoted) {
                helper.addActions(
                    actionFromScope(scopeChar(reader.cursor, ["quote"])),
                    actionFromScope(scopeChar(start + 1, ["quote"])),
                );
            }
            return helper.succeed(1);
        }
    }
}
