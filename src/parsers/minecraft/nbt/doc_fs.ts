import * as path from "path";

export class MemoryFS {
    private data: { [index: string]: Buffer } = {};
    private root: string;

    public constructor(root: string) {
        this.root = root;
    }

    public clear(): void {
        this.data = {};
    }

    public get(p: string): Buffer {
        return this.data[path.resolve(this.root, p)];
    }

    public isEmpty(): boolean {
        return Object.keys(this.data).length === 0;
    }

    public set(p: string, b: Buffer): void {
        this.data[path.resolve(this.root, p)] = b;
    }
}
