import * as path from "path";
import { readJSONRaw } from "../../../misc_functions/promisified_fs";

export class MemoryFS {
    private data: { [internalPath: string]: any };
    private root: string;

    public constructor(root: string, internal?: MemoryFS["data"]) {
        this.root = root;
        this.data = internal || {};
    }

    public clear(): void {
        this.data = {};
    }

    public get<T>(internalPath: string): T {
        return this.data[internalPath];
    }

    public isEmpty(): boolean {
        return Object.keys(this.data).length === 0;
    }

    public async load(realPath: string): Promise<void> {
        if (path.extname(realPath) === ".json") {
            const data = await readJSONRaw(realPath);
            this.setExternal(realPath, data);
        }
    }

    public set(internalPath: string, data: any): void {
        this.data[internalPath] = data;
    }

    public setExternal(realPath: string, data: any): void {
        const internalPath = path.relative(this.root, realPath);
        this.data[internalPath] = data;
    }
}
