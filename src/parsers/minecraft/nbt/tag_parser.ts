import { StringReader } from "../../../brigadier_components/string_reader";
import { isSuccessful, ReturnHelper } from "../../../misc_functions";
import { ReturnFailure, ReturnSuccess } from "../../../types";
import { NBTTagByteArray } from "./tag/byte_array_tag";
import { NBTTagByte } from "./tag/byte_tag";
import { NBTTagCompound } from "./tag/compound_tag";
import { NBTTagDouble } from "./tag/double_tag";
import { NBTTagFloat } from "./tag/float_tag";
import { NBTTagIntArray } from "./tag/int_array_tag";
import { NBTTagInt } from "./tag/int_tag";
import { NBTTagList } from "./tag/list_tag";
import { NBTTagLongArray } from "./tag/long_array_tag";
import { NBTTagLong } from "./tag/long_tag";
import { NBTTag, ParseReturn } from "./tag/nbt_tag";
import { NBTTagShort } from "./tag/short_tag";
import { NBTTagString } from "./tag/string_tag";
import { CorrectLevel, NBTErrorData } from "./util/nbt_util";

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
): ReturnSuccess<NBTTag<any>> | ReturnFailure<NBTErrorData> {
    let correctTag: NBTTag<any> | undefined;
    let correctness: CorrectLevel = 0;
    let correctPlace: number = reader.cursor;

    let lastResult: ParseReturn;
    const helper = new ReturnHelper();

    const start = reader.cursor;
    for (const pf of parsers.slice(0)) {
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
        return new ReturnHelper().failWithData({ correct: correctness });
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
        helper.merge(lastResult);
        return helper.failWithData(lastResult.data);
    }
}
