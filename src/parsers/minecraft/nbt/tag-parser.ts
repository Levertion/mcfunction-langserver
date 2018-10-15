import { StringReader } from "../../../brigadier/string-reader";
import { ReturnHelper } from "../../../misc-functions";
import { CE, ReturnedInfo } from "../../../types";
import { NBTTagByteArray } from "./tag/byte-array-tag";
import { NBTTagByte } from "./tag/byte-tag";
import { NBTTagCompound } from "./tag/compound-tag";
import { NBTTagDouble } from "./tag/double-tag";
import { NBTTagFloat } from "./tag/float-tag";
import { NBTTagIntArray } from "./tag/int-array-tag";
import { NBTTagInt } from "./tag/int-tag";
import { NBTTagList } from "./tag/list-tag";
import { NBTTagLongArray } from "./tag/long-array-tag";
import { NBTTagLong } from "./tag/long-tag";
import { NBTTag, ParseReturn } from "./tag/nbt-tag";
import { NBTTagShort } from "./tag/short-tag";
import { NBTTagString } from "./tag/string-tag";
import { Correctness } from "./util/nbt-util";

const parsers: Array<(path: string[]) => NBTTag> = [
    path => new NBTTagByte(path),
    path => new NBTTagShort(path),
    path => new NBTTagLong(path),
    path => new NBTTagFloat(path),
    path => new NBTTagDouble(path),
    path => new NBTTagInt(path),
    path => new NBTTagByteArray(path),
    path => new NBTTagIntArray(path),
    path => new NBTTagLongArray(path),
    path => new NBTTagCompound(path),
    path => new NBTTagList(path),
    path => new NBTTagString(path)
];

export type AnyTagReturn = ReturnedInfo<NBTTag, CE>;

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
    for (const parserFunc of parsers) {
        reader.cursor = start;
        const tag = parserFunc(path);
        const out = tag.parse(reader);
        if (
            out.data === Correctness.CERTAIN ||
            out.data < ((info && info.correctness) || Correctness.NO)
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
