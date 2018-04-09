import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTHighlightAction, parseIntNBT, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export const BYTE_TAG_SUFFIX = "b";

export class NBTTagByte extends NBTTag<number> {

    public tagType: "byte" = "byte";

    public getHover() {
        return [];
    }

    public getHighlight(): NBTHighlightAction[] {
        return [
            {
                end: this.end,
                scopes: ["byte"],
                start: this.start,
            },
            {
                end: this.end,
                scopes: ["suffix"],
                start: this.end - 1,
            },
        ];
    }

    public _parse(reader: StringReader) {
        this.val = parseIntNBT(reader);
        tryWithData(() => reader.expect(BYTE_TAG_SUFFIX), {}, 0);
        this.correct = 2;
    }
}
