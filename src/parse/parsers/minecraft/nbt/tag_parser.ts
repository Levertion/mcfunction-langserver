import { StringReader } from "../../../../brigadier_components/string_reader";
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
import { NBTError } from "./util/nbt_error";

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

export function parseTag(reader: StringReader): NBTTag<any> {
    let correctTag: NBTTag<any> | null = null;
    let correctPlace: number = reader.cursor;
    let lastErr: NBTError | null = null;
    const start = reader.cursor;
    for (const pf of parsers.slice(0)) {
        try {
            const p = pf();
            reader.cursor = start;
            p.parse(reader);
            if (correctTag === null || p.isCorrect() >= correctTag.isCorrect()) {
                correctTag = p;
                correctPlace = reader.cursor;
            }
        } catch (e) {
            const ex = e as NBTError;
            if (lastErr === null || ex.correct >= lastErr.correct) {
                lastErr = e;
            }
        }
    }
    if (correctTag !== null) {
        reader.cursor = correctPlace;
        return correctTag;
    }
    throw lastErr;
}
