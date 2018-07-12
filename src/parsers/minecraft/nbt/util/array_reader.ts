export class ArrayReader {
    private arr: string[];
    private index = 0;

    public constructor(arr: string[]) {
        this.arr = arr;
    }

    public end(): boolean {
        return this.index === this.arr.length;
    }

    public getArray(): string[] {
        return this.arr;
    }

    public getIndex(): number {
        return this.index;
    }

    public getRead(): string[] {
        return this.arr.slice(0, this.index);
    }

    public insert(val: string[], index: number = 0): void {
        this.arr.splice(index, 0, ...val);
    }

    public peek(): string {
        return this.arr[this.index];
    }

    public read(): string {
        return this.arr[this.index++];
    }

    public setIndex(val: number): void {
        this.index = val;
    }

    public skip(): void {
        this.index++;
    }
}
