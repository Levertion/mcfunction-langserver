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

const parsers: NBTTag[] = [
    new NBTTagByte(),
    new NBTTagShort(),
    new NBTTagLong(),
    new NBTTagFloat(),
    new NBTTagDouble(),
    new NBTTagInt(),
    new NBTTagByteArray(),
    new NBTTagIntArray(),
    new NBTTagLongArray(),
    new NBTTagCompound(),
    new NBTTagString(),
    new NBTTagList(),
];

export function parseTag(reader: StringReader): NBTTag {
    let correctTag: NBTTag | null = null;
    let lastErr: NBTError | null = null;
    for (const p of parsers.slice(0)) {
        try {
            p.parse(reader);
            if (correctTag === null || p.isCorrect() >= correctTag.isCorrect()) {
                correctTag = p;
            }
        } catch (e) {
            const ex = e as NBTError;
            if (lastErr === null || ex.correct >= lastErr.correct) {
                lastErr = e;
            }
        }
    }
    if (correctTag !== null) {
        return correctTag;
    }
    throw lastErr;
}
