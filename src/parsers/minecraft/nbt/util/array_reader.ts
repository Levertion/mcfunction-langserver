export class ArrayReader {
    private arr: string[];
    private index = 0;

    public constructor(arr: string[]) {
        this.arr = arr;
    }

    public end() {
        return this.index === this.arr.length;
    }

    public getArray() {
        return this.arr;
    }

    public getIndex() {
        return this.index;
    }

    public getRead() {
        return this.arr.slice(0, this.index);
    }

    public insert(val: string[], index: number = 0) {
        this.arr = [
            ...this.arr.slice(0, index),
            ...val,
            ...this.arr.slice(index)
        ];
    }

    public peek() {
        return this.arr[this.index];
    }

    public read() {
        return this.arr[this.index++];
    }

    public setIndex(val: number) {
        this.index = val;
    }

    public skip() {
        this.index++;
    }
}
