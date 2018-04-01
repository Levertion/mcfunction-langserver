import { StringReader } from "../../../../../brigadier_components/string_reader";
import { NBTHighlightAction, tryWithData } from "../util/nbt_util";
import { NBTTag } from "./nbt_tag";

export class NBTTagString extends NBTTag<string> {
    public tagType: "string" = "string";

    private quoted: boolean = false;

    public getHover() {
        return [];
    }

    public getHighlight(): NBTHighlightAction[] {
        const scopes = [
            {
                end: this.end,
                scopes: ["string", this.quoted ? "quoted" : "unquoted"],
                start: this.start,
            },
        ];

        if (this.quoted) {
            scopes.push(
                {
                    end: this.start + 1,
                    scopes: ["string-start", "start"],
                    start: this.start,
                },
                {
                    end: this.end,
                    scopes: ["string-end", "end"],
                    start: this.end - 1,
                },
            );
        }

        return scopes;
    }

    public _parse(reader: StringReader) {
        this.quoted = reader.peek() === "\"";
        tryWithData(() => this.val = reader.readString(), {}, 1);
        this.correct = 1;
    }
}
