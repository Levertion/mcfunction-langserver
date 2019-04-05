import { CompletionItemKind } from "vscode-languageserver";

import { StringReader } from "../brigadier/string-reader";
import { DEFAULT_NAMESPACE, NAMESPACE } from "../consts";
import { CE, ID, ReturnedInfo } from "../types";

import { readNamespaceSegment, ReturnHelper } from ".";
import { stringArrayToIDs, stringifyID } from "./id";

export type SerializedIDMap<T> = Array<[string, Array<[string, T]>]>;

export interface MaybeResolved<T, R> {
    raw: T;
    resolved?: R;
}

export interface Resolved<T, R> extends MaybeResolved<T, R> {
    resolved: R;
}

export interface NamespaceMapParseResult<T, R> extends Resolved<T, R> {
    id: ID;
}

export type IdMapGetType<T, R> = R extends undefined ? T : Resolved<T, R>;

export class IDMap<T, R = undefined, C = undefined> {
    /**
     * The function which should be used when creating a description for a suggestion
     */
    public set suggestionDescriptionFunction(
        v: undefined | ((value: T, id: ID, resolved: R, context: C) => string)
    ) {
        this._descriptionFunction = v;
    }

    public static fromIDs(...ids: ID[]): IdSet {
        const result = new IDMap<undefined>();
        for (const id of ids) {
            result.add(id);
        }
        return result;
    }

    public static fromStringArray(strings: string[]): IdSet {
        return IDMap.fromIDs(...stringArrayToIDs(strings));
    }

    private _descriptionFunction:
        | undefined
        | ((value: T, id: ID, resolved: R, context: C) => string);

    private readonly map: Map<
        string,
        Map<string, MaybeResolved<T, R>>
    > = new Map();

    private readonly resolver: R extends undefined
        ? undefined
        : (input: T, map: IDMap<T, R, C>) => R;

    public constructor(
        ...resolver: R extends undefined ? [] : [IDMap<T, R, C>["resolver"]]
    ) {
        this.resolver = resolver[0] as any;
    }

    public *[Symbol.iterator](): IterableIterator<[ID, T]> {
        for (const [namespace, map] of this.map) {
            for (const [path, maybeResolved] of map) {
                yield [{ namespace, path }, maybeResolved.raw];
            }
        }
    }

    public add(
        id: ID,
        // Hack to improve the ergonomics of IdSet
        ...value: T extends undefined ? [] : [T]
    ): void {
        const innerMap = this.namespaceMapOrDefault(id.namespace);
        innerMap.set(id.path, { raw: value[0] as T });
    }

    public addFrom(other: IDMap<T, R>): void {
        other.map.forEach((v, k) => {
            const map = this.namespaceMapOrDefault(k);
            v.forEach((value, key) => {
                map.set(key, value);
            });
        });
    }

    public addSerialized(serialised: SerializedIDMap<T>): void;
    public addSerialized<A>(
        serialised: SerializedIDMap<A>,
        mapfunction?: (val: A) => T
    ): void;
    public addSerialized<A = T>(
        serialised: SerializedIDMap<A>,
        mapfunction?: (val: A) => T
    ): void {
        for (const [namespace, map] of serialised) {
            const namespaceMap = this.namespaceMapOrDefault(namespace);
            for (const [path, raw] of map) {
                namespaceMap.set(path, {
                    raw: mapfunction
                        ? mapfunction(raw)
                        : ((raw as unknown) as T)
                });
            }
        }
    }

    public edit(id: ID): T | undefined {
        const val = this.getRaw(id);
        if (val) {
            val.resolved = undefined;
            return val.raw;
        }
        return undefined;
    }

    public get(id: ID): IdMapGetType<T, R> | undefined {
        const val = this.getResolved(id);
        if (val) {
            if (typeof val.resolved === "undefined") {
                return val as IdMapGetType<T, R>;
            } else {
                return val.raw as IdMapGetType<T, R>;
            }
        }
        return undefined;
    }

    public getUnresolved(id: ID): T | undefined {
        const value = this.getRaw(id);
        return value && value.raw;
    }

    public has(id: ID): boolean {
        const innerMap = this.namespaceMap(id.namespace);
        return !!(innerMap && innerMap.has(id.path));
    }

    /**
     * Parse an ID from this map. This will not add any errors, it is left to the caller
     * to check that there is nothing following.
     *
     * @param namespaceCharacter The character to use as the namespace character
     *
     * @returns ReturnSuccess containing the wrapped T and the ID or ReturnFailure with the best effort parsed ID
     */
    public parse(
        reader: StringReader,
        context: C,
        namespaceCharacter: string = NAMESPACE
    ): ReturnedInfo<NamespaceMapParseResult<T, R>, CE, ID> {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const firstSegment = readNamespaceSegment(reader, namespaceCharacter);
        if (reader.canRead() && reader.peek() === namespaceCharacter) {
            reader.skip();
            const pathStart = reader.cursor;
            const path = readNamespaceSegment(reader, namespaceCharacter);
            const id: ID = { namespace: firstSegment, path };
            if (!reader.canRead()) {
                const map = this.namespaceMap(firstSegment);
                if (map) {
                    map.forEach((maybeResolved, key) => {
                        helper.addSuggestion(
                            pathStart,
                            key,
                            CompletionItemKind.EnumMember,
                            this._descriptionFunction
                                ? this._descriptionFunction(
                                      maybeResolved.raw,
                                      {
                                          namespace: firstSegment,
                                          path
                                      },
                                      maybeResolved.resolved ||
                                          (this.resolver &&
                                              this.resolver(
                                                  maybeResolved.raw,
                                                  this
                                              )),
                                      context
                                  )
                                : undefined
                        );
                    });
                }
            }
            const value = this.getResolved(id);
            if (typeof value !== "undefined") {
                return helper.succeed<NamespaceMapParseResult<T, R>>({
                    ...value,
                    id
                });
            }
            return helper.failWithData(id);
        } else {
            if (!reader.canRead()) {
                helper.addSuggestion(reader.cursor, namespaceCharacter);
                this.map.forEach((_, key) => {
                    helper.addSuggestion(
                        start,
                        key + namespaceCharacter,
                        CompletionItemKind.EnumMember
                    );
                });
                const defaultMap = this.namespaceMap();
                if (defaultMap) {
                    defaultMap.forEach((_, key) => {
                        const v = this.getResolved({ path: key });
                        if (v) {
                            helper.addSuggestion(
                                start,
                                stringifyID({ path: key }, namespaceCharacter),
                                CompletionItemKind.Constant,
                                this._descriptionFunction &&
                                    this._descriptionFunction(
                                        v.raw,
                                        {
                                            path: firstSegment
                                        },
                                        v.resolved,
                                        context
                                    )
                            );
                        }
                    });
                }
            }
            const id: ID = { path: firstSegment };
            const value = this.getResolved(id);
            if (typeof value !== "undefined") {
                return helper.succeed<NamespaceMapParseResult<T, R>>({
                    ...value,
                    id
                });
            }
            return helper.failWithData(id);
        }
    }

    public remove(id: ID): boolean {
        const map = this.namespaceMap(id.namespace);
        if (map) {
            const result = map.delete(id.path);
            if (map.size === 0) {
                this.map.delete(id.namespace || DEFAULT_NAMESPACE);
            }
            return result;
        }
        return false;
    }

    public serialize(): SerializedIDMap<T>;
    public serialize<A>(
        mapfunction?: (val: T) => A | false
    ): SerializedIDMap<A>;
    public serialize<A = T>(
        mapfunction?: (val: T) => A | false
    ): SerializedIDMap<A> {
        return [...this.map].map(([namespace, inner]) => [
            namespace,
            [...inner]
                .map(v => [
                    v[0],
                    mapfunction ? mapfunction(v[1].raw) : v[1].raw
                ])
                .filter(v => v[1] !== false)
        ]) as SerializedIDMap<A>;
    }

    private getRaw(id: ID): MaybeResolved<T, R> | undefined {
        const innerMap = this.namespaceMap(id.namespace);
        return innerMap && innerMap.get(id.path);
    }

    private getResolved(id: ID): Resolved<T, R> | undefined {
        const val = this.getRaw(id);
        if (val) {
            val.resolved =
                val.resolved || (this.resolver && this.resolver(val.raw, this));
            return val as Resolved<T, R>;
        }
        return undefined;
    }

    private namespaceMap(
        namespace: string = DEFAULT_NAMESPACE
    ): Map<string, MaybeResolved<T, R>> | undefined {
        return this.map.get(namespace);
    }

    private namespaceMapOrDefault(
        namespace: string = DEFAULT_NAMESPACE
    ): Map<string, MaybeResolved<T, R>> {
        const result = this.map.get(namespace);
        if (typeof result !== "undefined") {
            return result;
        }
        const newMap = new Map();
        this.map.set(namespace, newMap);
        return newMap;
    }
}

// TODO: Make this its own class
export type IdSet = IDMap<undefined>;
