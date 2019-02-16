import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import {
    ContextPath,
    ReturnHelper,
    startPaths,
    stringifyNamespace
} from "../../misc-functions";
import {
    CommandContext,
    LineRange,
    Parser,
    Ranged,
    ReturnedInfo,
    ReturnSuccess
} from "../../types";

import { NBTIDInfo } from "./nbt/nbt";
import { parseAnyNBTTag } from "./nbt/tag-parser";
import { NBTTag } from "./nbt/tag/nbt-tag";
import {
    TypedNode,
    NodeInfo,
    isListInfo,
    isTypedInfo
} from "./nbt/util/doc-walker-util";
import { COMPOUND_START } from "./nbt/util/nbt-util";
import { NBTWalker } from "./nbt/walker";
import { NBTNode } from "mc-nbt-paths";

const DOT = ".";
const ARROPEN = "[";
const ARRCLOSE = "]";

const exceptions = {
    BAD_CHAR: new CommandErrorBuilder(
        "argument.nbt_path.badchar",
        "Bad character '%s'"
    ),
    INCORRECT_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.unknown",
        "Unknown segment '%s'"
    ),
    START_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.array_start",
        "Cannot start an nbt path with an array reference"
    ),
    UNEXPECTED_INDEX: new CommandErrorBuilder(
        "argument.nbt_path.unknown",
        "Path segment should not be array, expected type is '%s'"
    ),
    WRONG_TYPE: new CommandErrorBuilder(
        "argument.nbt_path.type",
        "Expected node to have type %s, actual is %s"
    )
};

function entityDataPath(
    path: string[]
): ContextPath<(context: CommandContext) => PathResult> {
    return {
        data: c => ({
            contextInfo: {
                ids:
                    (c.otherEntity &&
                        c.otherEntity.ids &&
                        // tslint:disable-next-line:no-unnecessary-callback-wrapper
                        c.otherEntity.ids.map(v => stringifyNamespace(v))) ||
                    "none",
                kind: "entity"
            },
            resultType: c.nbt_path
        }),
        path
    };
}

interface PathResult {
    contextInfo: NBTIDInfo;
    resultType?: TypedNode["type"];
}

const pathInfo: Array<ContextPath<(context: CommandContext) => PathResult>> = [
    entityDataPath(["execute", "if", "data", "entity"]),
    entityDataPath(["execute", "store", "result", "entity"]),
    entityDataPath(["execute", "store", "success", "entity"]),
    entityDataPath(["execute", "unless", "data", "entity"]),
    entityDataPath(["data", "modify", "entity", "target", "targetPath"]),
    entityDataPath(["data", "remove", "entity"]),
    entityDataPath([
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "insert",
        "before",
        "index",
        "from",
        "entity"
    ]),
    entityDataPath(["data", "get", "entity"]),
    entityDataPath([
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "set",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "prepend",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "merge",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "insert",
        "before",
        "index",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "set",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "prepend",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "merge",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "append",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "insert",
        "after",
        "index",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "insert",
        "after",
        "index",
        "from",
        "entity"
    ]),
    entityDataPath([
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "append",
        "from",
        "entity"
    ])
];

// We do not currently support blocks with autocomplete/validation
const unvalidatedPaths = [
    //#region /data
    ["data", "get", "block"],
    ["data", "modify", "block", "targetPos", "targetPath"],
    [
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "append",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "insert",
        "after",
        "index",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "insert",
        "before",
        "index",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "merge",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "prepend",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "block",
        "targetPos",
        "targetPath",
        "set",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "append",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "insert",
        "after",
        "index",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "insert",
        "before",
        "index",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "merge",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "prepend",
        "from",
        "block"
    ],
    [
        "data",
        "modify",
        "entity",
        "target",
        "targetPath",
        "set",
        "from",
        "block"
    ],
    ["data", "remove", "block"],
    //#endregion /data
    //#region /execute
    ["execute", "if", "data", "block"],
    ["execute", "store", "result", "block"],
    ["execute", "store", "success", "block"],
    ["execute", "unless", "data", "block"]
    //#endregion /execute
].map<ContextPath<{}>>(v => {
    return { path: v, data: {} };
});

const typedArrayTypes = new Set<TypedNode["type"]>([
    "byte_array",
    "int_array",
    "long_array"
]);

export const pathParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const path = parsePath(reader);
        helper.merge(path);

        const contextFunction = startPaths(pathInfo, info.path);
        const context = contextFunction && contextFunction(info.context);
        if (context) {
            const walker = new NBTWalker(info.data.globalData.nbt_docs);
            if (Array.isArray(context.contextInfo.ids)) {
                for (const id of context.contextInfo.ids) {
                    const node = walker.getInitialNode([
                        context.contextInfo.kind,
                        id
                    ]);
                }
            } else {
                const node = walker.getInitialNode([
                    context.contextInfo.kind,
                    context.contextInfo.ids || "none"
                ]);
            }
        } else {
            const unvalidatedInfo = startPaths(unvalidatedPaths, info.path);
            if (typeof unvalidatedInfo === "undefined") {
                // TODO: Centralise this checking
                mcLangLog(
                    `Unexpected unsupported nbt path '${
                        info.path
                    }'. Please report this error at https://github.com/levertion/mcfunction-langserver/issues`
                );
            }
        }
        return helper.succeed();
    }
};

function validatePath(
    path: PathParseResult,
    nbtPath: string[],
    walker: NBTWalker,
    cursor: number
): ReturnSuccess<undefined> {
    const helper = new ReturnHelper();
    let node: NodeInfo<NBTNode> | undefined = walker.getInitialNode(nbtPath);
    for (const segment of path) {
        let { value, range } = segment;
        value;
        switch (value.kind) {
            case SegmentKind.INDEX:
                if (node) {
                    if (isListInfo(node)) {
                        node = walker.getItem(node);
                    } else if (
                        isTypedInfo(node) &&
                        typedArrayTypes.has(node.node.type)
                    ) {
                        node = undefined;
                    } else {
                        const toDisplay = isTypedInfo(node)
                            ? node.node.type
                            : "unknown";
                        helper.addErrors(
                            exceptions.UNEXPECTED_INDEX.create(
                                range.start,
                                range.end,
                                toDisplay
                            )
                        );
                        node = undefined;
                    }
                }
                break;
            case SegmentKind.NBT:
                if (node) {
                    if (isListInfo(node)) {
                        const item = walker.getItem(node);
                    } else {
                        const toDisplay = isTypedInfo(node)
                            ? node.node.type
                            : "unknown";
                        helper.addErrors(
                            exceptions.UNEXPECTED_INDEX.create(
                                range.start,
                                range.end,
                                toDisplay
                            )
                        );
                        node = undefined;
                    }
                }
                break;
            case SegmentKind.STRING:
                break;
            default:
                break;
        }
    }
    return helper.succeed();
}

// These number and nbt ranges include the open and close []
// The string ranges do not include the .
type PathParseResult = Array<Ranged<PathSegment>>;
type PathSegment =
    | { tag: NBTTag; kind: SegmentKind.NBT }
    | { number: number; kind: SegmentKind.INDEX }
    | { string: string; finished: boolean; kind: SegmentKind.STRING };

enum SegmentKind {
    NBT,
    INDEX,
    STRING
}

function parsePath(reader: StringReader): ReturnedInfo<PathParseResult> {
    const helper = new ReturnHelper();
    const result: PathParseResult = [];
    let first = true;
    while (reader.canRead()) {
        const start = reader.cursor;
        if (reader.peek() === ARROPEN) {
            const range: LineRange = { start, end: 0 };
            reader.skip();
            if (reader.peek() === COMPOUND_START) {
                const val = parseAnyNBTTag(reader, []);
                range.end = reader.cursor;
                if (helper.merge(val)) {
                    result.push({
                        range,
                        value: { tag: val.data.tag, kind: SegmentKind.NBT }
                    });
                } else {
                    if (val.data) {
                        result.push({
                            range,
                            value: { tag: val.data.tag, kind: SegmentKind.NBT }
                        });
                    }
                    return helper.fail();
                }
            } else {
                const int = reader.readInt();
                range.end = reader.cursor;
                if (helper.merge(int)) {
                    result.push({
                        range,
                        value: { number: int.data, kind: SegmentKind.INDEX }
                    });
                } else {
                    return helper.fail();
                }
            }
            if (!helper.merge(reader.expect(ARRCLOSE))) {
                range.end = reader.cursor;
                return helper.fail();
            }
            range.end = reader.cursor;
        } else if ((!first && reader.peek() === DOT) || first) {
            if (!first) {
                reader.skip();
            }
            const range: LineRange = { start: reader.cursor, end: 0 };
            const res = reader.readString(/^[0-9A-Za-z_\-+]$/);
            range.end = reader.cursor;
            if (helper.merge(res)) {
                result.push({
                    range,
                    value: {
                        string: res.data,
                        finished: true,
                        kind: SegmentKind.STRING
                    }
                });
            } else {
                if (res.data !== undefined) {
                    result.push({
                        range,
                        value: {
                            string: res.data,
                            finished: false,
                            kind: SegmentKind.STRING
                        }
                    });
                }
                return helper.fail();
            }
        } else {
            return helper.fail(
                exceptions.BAD_CHAR.create(
                    reader.cursor - 1,
                    reader.cursor,
                    reader.peek()
                )
            );
        }
        first = false;
    }
    return helper.succeed(result);
}
