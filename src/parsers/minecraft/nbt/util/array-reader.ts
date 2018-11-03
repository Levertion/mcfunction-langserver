export class ArrayReader {
    private index = 0;
    private readonly inner: string[];

    public constructor(arr: string[]) {
        this.inner = arr;
    }

    public canRead(length: number = 1): boolean {
        return this.index + length <= this.inner.length;
    }

    public getArray(): string[] {
        return this.inner;
    }

    public getIndex(): number {
        return this.index;
    }

    public getRead(): string[] {
        return this.inner.slice(0, this.index);
    }

    public insert(vals: string[], index: number = 0): void {
        this.inner.splice(index, 0, ...vals);
    }

    public peek(): string {
        return this.inner[this.index];
    }

    public read(): string {
        return this.inner[this.index++];
    }

    public setIndex(val: number): void {
        this.index = val;
    }

    public skip(): void {
        this.index++;
    }
}
