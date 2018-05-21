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
import { NBTTag } from "./tag/nbt_tag";
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
    () => new NBTTagString(""),
    () => new NBTTagList([]),
];

export function parseTag(reader: StringReader):
    ReturnSuccess<NBTTag<any>> | ReturnFailure<NBTErrorData> {
    let correctTag: NBTTag<any> | null = null;
    let correctness: CorrectLevel = 0;
    let correctPlace: number = reader.cursor;

    let lastSuccess: ReturnSuccess<CorrectLevel> | null = null;
    let lastErr: ReturnFailure<NBTErrorData> | null = null;
    const helper = new ReturnHelper();

    const start = reader.cursor;
    for (const pf of parsers.slice(0)) {
        const p = pf();
        reader.cursor = start;
        const out = p.parse(reader);
        if (isSuccessful(out) && correctTag === null || out.data > correctness) {
            correctTag = p;
            correctness = out.data as CorrectLevel;
            correctPlace = reader.cursor;
            lastSuccess = out as ReturnSuccess<CorrectLevel>;
        } else {
            lastErr = out as ReturnFailure<NBTErrorData>;
        }
    }
    if (lastErr === null || lastSuccess === null) {
        return ReturnHelper.fail({ correct: correctness });
    }
    if (correctTag !== null) {
        reader.cursor = correctPlace;
        helper.merge(lastSuccess);
        return helper.succeed(correctTag);
    }
    helper.merge(lastErr);
    return helper.failWithData(lastErr.data as NBTErrorData);
}
