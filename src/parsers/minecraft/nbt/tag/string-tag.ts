import { QUOTE, StringReader } from "../../../../brigadier/string-reader";
import { ReturnHelper } from "../../../../misc-functions";
import { ReturnSuccess } from "../../../../types";
import { NodeInfo } from "../util/doc-walker-util";
import { Correctness } from "../util/nbt-util";
import { NBTWalker } from "../walker";
import { NBTTag, ParseReturn } from "./nbt-tag";

export class NBTTagString extends NBTTag {
    public tagType: "string" = "string";
    public value: string | undefined;

    public validate(
        anyInfo: NodeInfo,
        // tslint:disable-next-line:variable-name
        _walker: NBTWalker
    ): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        const result = this.sameType(anyInfo);
        if (!helper.merge(result)) {
            return helper.succeed();
        }
        // #const info = anyInfo as NodeInfo<NoPropertyNode>;
        if (this.value && this.value.length === 0) {
            helper.addErrors(); // Empty string error?
        }
        return helper.succeed();
    }

    protected readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const quoted = reader.peek() === QUOTE;
        const str = reader.readString();
        this.value = str.data;
        if (helper.merge(str)) {
            return helper.succeed(
                quoted ? Correctness.CERTAIN : Correctness.MAYBE
            );
        } else {
            return helper.failWithData(Correctness.NO);
        }
    }
}
