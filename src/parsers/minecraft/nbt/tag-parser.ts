import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import { CE, ReturnedInfo } from "../../../types";

import { NBTTagCompound } from "./tag/compound-tag";
import { NBTTagList } from "./tag/list-tag";
import { NBTTag, ParseReturn } from "./tag/nbt-tag";
import { NBTTagNumber } from "./tag/number";
import { NBTTagString } from "./tag/string-tag";
import { NBTTagTypedList } from "./tag/typed-list-tag";
import { Correctness } from "./util/nbt-util";

const parsers: Array<new (path: string[]) => NBTTag> = [
    NBTTagNumber,
    NBTTagTypedList,
    NBTTagCompound,
    NBTTagList,
    NBTTagString
];

export type AnyTagReturn = ReturnedInfo<NBTTag>;

export interface CorrectInfo {
    correctness: Correctness;
    tag: NBTTag;
}
export function parseAnyNBTTag(
    reader: StringReader,
    path: string[]
): ReturnedInfo<CorrectInfo, CE, CorrectInfo | undefined> {
    let info: CorrectInfo | undefined;
    let last: ParseReturn | undefined;
    const helper = new ReturnHelper();
    const start = reader.cursor;
    for (const parserContructor of parsers) {
        reader.cursor = start;
        const tag = new parserContructor(path);
        const out = tag.parse(reader);
        if (
            out.data === Correctness.CERTAIN ||
            out.data > ((info && info.correctness) || Correctness.NO)
        ) {
            info = { correctness: out.data, tag };
            last = out;
        }
        if (out.data === Correctness.CERTAIN) {
            break;
        }
    }
    // Maybe add could not parse nbt tag error
    if (info === undefined || last === undefined) {
        return helper.fail();
    }
    reader.cursor = info.tag.getRange().end;
    if (helper.merge(last)) {
        return helper.succeed(info);
    } else {
        return helper.failWithData(info);
    }
}
