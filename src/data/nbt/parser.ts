import { promisify } from "util";
import * as zlib from "zlib";

import { BufferStream } from "./buffer-stream";

const unzipAsync = promisify<zlib.InputType, Buffer>(zlib.unzip);

let tags: Tag;

type tagparser<T> = (buffer: BufferStream) => T;

const nbtbyte = (buffer: BufferStream) => buffer.getByte();
const nbtshort = (buffer: BufferStream) => buffer.getShort();
const nbtint = (buffer: BufferStream) => buffer.getInt();
const nbtlong = (buffer: BufferStream) => buffer.getLong();
const nbtfloat = (buffer: BufferStream) => buffer.getFloat();
const nbtdouble = (buffer: BufferStream) => buffer.getDouble();

const nbtbytearray = (buffer: BufferStream) => {
    const len = buffer.getInt();
    const out: number[] = [];
    for (let i = 0; i < len; i++) {
        out.push(buffer.getByte());
    }
    return out;
};

const nbtstring = (buffer: BufferStream) => buffer.getUTF8();

const nbtlist = (buffer: BufferStream) => {
    const id = buffer.getByte();
    const len = buffer.getInt();
    const parser = tags[id];
    const out: any[] = [];
    for (let i = 0; i < len; i++) {
        out.push(parser(buffer));
    }
    return out;
};

const nbtcompound = (buffer: BufferStream) => {
    let tag: number = buffer.getByte();
    const out: { [key: string]: any } = {};
    while (tag !== 0) {
        const name = buffer.getUTF8();
        const parser = tags[tag];
        out[name] = parser(buffer);
        tag = buffer.getByte();
    }
    return out;
};

const nbtintarray = (buffer: BufferStream) => {
    const len = buffer.getInt();
    const out: number[] = [];
    for (let i = 0; i < len; i++) {
        out.push(buffer.getInt());
    }
    return out;
};

const nbtlongarray = (buffer: BufferStream) => {
    const len = buffer.getInt();
    const out: Long[] = [];
    for (let i = 0; i < len; i++) {
        out.push(buffer.getLong());
    }
    return out;
};

interface Tag {
    [id: number]: tagparser<any>;
}

tags = {
    // Need to redeclare because of TSLint
    1: nbtbyte,
    2: nbtshort,
    3: nbtint,
    4: nbtlong,
    5: nbtfloat,
    6: nbtdouble,
    7: nbtbytearray,
    8: nbtstring,
    9: nbtlist,
    10: nbtcompound,
    11: nbtintarray,
    12: nbtlongarray
};

export async function parse<T>(
    buffer: Buffer,
    named: boolean = true
): Promise<T> {
    let unzipbuf;
    try {
        unzipbuf = await unzipAsync(buffer);
    } catch (e) {
        unzipbuf = buffer;
    }
    const stream = new BufferStream(unzipbuf);
    const id = stream.getByte();
    if (named) {
        stream.getUTF8(); // Name
    }
    const parser = tags[id];
    return parser(stream) as T;
}
