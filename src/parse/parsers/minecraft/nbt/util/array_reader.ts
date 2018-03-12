
export class ArrayReader {
    private index = 0;
    private arr: string[];

    constructor(arr: string[]) {
        this.arr = arr;
    }

    public getIndex() {
        return this.index;
    }

    public setIndex(val: number) {
        this.index = val;
    }

    public read() {
        return this.arr[this.index++];
    }

    public skip() {
        this.index++;
    }

    public peek() {
        return this.arr[this.index + 1];
    }

    public insert(val: string[], index = 0) {
        this.arr = [...this.arr.slice(0, index), ...val, ...this.arr.slice(index)];
    }

    public getArray() {
        return this.arr;
    }

    public end() {
        return this.index === this.arr.length;
    }

    public getRead() {
        return this.arr.slice(0, this.index);
    }
}
