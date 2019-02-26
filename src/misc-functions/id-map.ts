import { DEFAULT_NAMESPACE } from "../consts";
import { ID } from "../data/types";
import { stringArrayToIDs } from "./id";

export class IDMap<T> {
    public static fromIDs(...ids: ID[]): IDMap<undefined> {
        const result = new IDMap<undefined>();
        for (const id of ids) {
            result.add(id, undefined);
        }
        return result;
    }
    public static fromStringArray(strings: string[]): IDMap<undefined> {
        return IDMap.fromIDs(...stringArrayToIDs(strings));
    }

    private readonly map: Map<string, Map<string, T>> = new Map();

    public add(id: ID, value: T): void {
        const innerMap = this.namespaceMap(id.namespace);
        innerMap.set(id.path, value);
    }
    public get(id: ID): T | undefined {
        const innerMap = this.namespaceMap(id.namespace);
        return innerMap.get(id.path);
    }

    private namespaceMap(namespace?: string): Map<string, T> {
        const result = this.map.get(namespace || DEFAULT_NAMESPACE);
        if (typeof result !== "undefined") {
            return result;
        }
        const newMap = new Map();
        this.map.set(namespace || DEFAULT_NAMESPACE, newMap);
        return newMap;
    }
}
