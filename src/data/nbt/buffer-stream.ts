import * as Long from "long";

export class BufferStream {
    private readonly buf: Buffer;
    private index: number;

    public constructor(buffer: Buffer) {
        this.index = 0;
        this.buf = buffer;
    }

    public getByte(): number {
        const out = this.buf.readInt8(this.index);
        this.index++;
        return out;
    }

    public getDouble(): number {
        const out = this.buf.readDoubleBE(this.index);
        this.index += 8;
        return out;
    }

    public getFloat(): number {
        const out = this.buf.readFloatBE(this.index);
        this.index += 4;
        return out;
    }

    public getInt(): number {
        const out = this.buf.readInt32BE(this.index);
        this.index += 4;
        return out;
    }

    public getLong(): Long {
        const arr = this.buf.subarray(this.index, this.index + 8);
        const outt: number[] = [];
        arr.forEach(v => outt.push(v));
        this.index += 8;
        return Long.fromBytesBE(outt);
    }

    public getShort(): number {
        const out = this.buf.readInt16BE(this.index);
        this.index += 2;
        return out;
    }

    public getUTF8(): string {
        const len = this.getShort();
        const out = this.buf.toString("utf8", this.index, this.index + len);
        this.index += len;
        return out;
    }
}
