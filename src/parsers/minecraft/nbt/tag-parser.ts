import { StringReader } from "../../../brigadier/string-reader";
import { isSuccessful, ReturnHelper } from "../../../misc-functions";
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
import { CorrectLevel, NBTErrorData } from "./util/nbt-util";

const parsers: Array<() => NBTTag<any>> = [
    () => new NBTTagByte(0),
    () => new NBTTagShort(0),
    () => new NBTTagLong(0),
    () => new NBTTagFloat(0),
    () => new NBTTagDouble(0),
    () => new NBTTagInt(0),
    () => new NBTTagByteArray([]),
    () => new NBTTagIntArray([]),
    () => new NBTTagLongArray([]),
    () => new NBTTagCompound({}),
    () => new NBTTagList([]),
    () => new NBTTagString("")
];

export function parseTag(
    reader: StringReader
): ReturnedInfo<NBTTag<any>, CE, NBTErrorData> {
    let correctTag: NBTTag<any> | undefined;
    let correctness: CorrectLevel = 0;
    let correctPlace: number = reader.cursor;

    let lastResult: ParseReturn | undefined;
    const helper = new ReturnHelper();

    const start = reader.cursor;
    for (const pf of parsers) {
        const p = pf();
        reader.cursor = start;
        const out = p.parse(reader);
        // @ts-ignore
        if (isSuccessful(out)) {
            if (out.data > correctness) {
                lastResult = out;
                correctPlace = reader.cursor;
                correctness = out.data;
                correctTag = p;
            }
        } else {
            if (out.data.correct > correctness) {
                lastResult = out;
                correctPlace = reader.cursor;
                correctness = out.data.correct;
            }
        }
    }
    // @ts-ignore
    if (lastResult === undefined) {
        return helper.failWithData({ correct: correctness });
    }
    if (helper.merge(lastResult)) {
        if (correctTag === undefined) {
            // This should never happen
            return helper.failWithData({ correct: correctness });
        } else {
            reader.cursor = correctPlace;
            return helper.succeed(correctTag);
        }
    } else {
        return helper.failWithData(lastResult.data);
    }
}
