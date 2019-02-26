import { CompletionItemKind } from "vscode-languageserver";

import { CommandErrorBuilder } from "../../brigadier/errors";
import {
    completionForString,
    StringReader
} from "../../brigadier/string-reader";
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
    ReturnSuccess,
    Suggestion
} from "../../types";

import { NBTIDInfo } from "./nbt/nbt";
import { parseAnyNBTTag } from "./nbt/tag-parser";
import { NBTTag } from "./nbt/tag/nbt-tag";
import {
    isCompoundInfo,
    isListInfo,
    isTypedInfo,
    NodeInfo,
    TypedNode
} from "./nbt/util/doc-walker-util";
import { COMPOUND_START } from "./nbt/util/nbt-util";
import { NBTWalker } from "./nbt/walker";

const DOT = ".";
const ARROPEN = "[";
const ARRCLOSE = "]";

const exceptions = {
    BAD_CHAR: new CommandErrorBuilder(
        "argument.nbt_path.badchar",
        "Bad character '%s'"
    ),
    INCORRECT_PROPERTY: new CommandErrorBuilder(
        "argument.nbt_path.incorrect",
        "Unknown property '%s'"
    ),
    START_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.array_start",
        "Cannot start an nbt path with an array reference"
    ),
    UNEXPECTED_INDEX: new CommandErrorBuilder(
        "argument.nbt_path.index",
        "Path segment should not be array, expected type is '%s'"
    ),
    UNEXPECTED_PROPERTY: new CommandErrorBuilder(
        "argument.nbt_path.property",
        "Node of type '%s' cannot have string properties, but one is here"
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
].map<ContextPath<{}>>(v => ({ path: v, data: {} }));

const typedArrayTypes = new Set<TypedNode["type"]>([
    "byte_array",
    "int_array",
    "long_array"
]);

// These number and nbt ranges include the open and close []
// The string ranges do not include the .
type PathParseResult = Array<Ranged<PathSegment>>;
type PathSegment =
    | { kind: SegmentKind.NBT; tag: NBTTag }
    | { kind: SegmentKind.INDEX; number: number }
    | { kind: SegmentKind.STRING; string: string };

enum SegmentKind {
    NBT,
    INDEX,
    STRING
}

export const pathParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper();
        const path = parsePath(reader);
        if (helper.merge(path)) {
            const contextFunction = startPaths(pathInfo, info.path);
            const context = contextFunction && contextFunction(info.context);
            if (context) {
                const walker = new NBTWalker(info.data.globalData.nbt_docs);
                if (Array.isArray(context.contextInfo.ids)) {
                    for (const id of context.contextInfo.ids) {
                        const result = validatePath(
                            path.data,
                            [context.contextInfo.kind, id],
                            walker,
                            reader.cursor,
                            info.context.nbt_path
                        );
                        helper.merge(result);
                    }
                    const errors = helper.getShared().errors;
                    for (let i = 0; i < errors.length; i++) {
                        const error = errors[i];
                        const sliced = [...errors.slice(i).entries()];
                        for (const [index, followingError] of sliced) {
                            if (
                                followingError.range.start ===
                                    error.range.start &&
                                followingError.range.end === error.range.end &&
                                followingError.text === error.text
                            ) {
                                errors.splice(index, 1);
                            }
                        }
                    }
                } else {
                    const result = validatePath(
                        path.data,
                        [
                            context.contextInfo.kind,
                            context.contextInfo.ids || "none"
                        ],
                        walker,
                        reader.cursor,
                        info.context.nbt_path
                    );
                    helper.merge(result);
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
        return helper.fail();
    }
};

const unquotedNBTStringRegex = /^[0-9A-Za-z_\-+]$/;
// tslint:disable-next-line:cyclomatic-complexity TODO: Fix or disable globally
function validatePath(
    path: PathParseResult,
    nbtPath: string[],
    walker: NBTWalker,
    // tslint:disable-next-line:variable-name underscore name as a temp measure
    cursor: number,
    expectedType: TypedNode["type"] | undefined
): ReturnSuccess<undefined> {
    const helper = new ReturnHelper();
    let node: NodeInfo | undefined = walker.getInitialNode(nbtPath);
    if (path.length === 0) {
        if (isCompoundInfo(node)) {
            helper.addSuggestions(
                ...Object.keys(walker.getChildren(node)).map<Suggestion>(v =>
                    completionForString(
                        v,
                        cursor,
                        {
                            quote: true,
                            unquoted: unquotedNBTStringRegex
                        },
                        CompletionItemKind.Field
                    )
                )
            );
        }
        return helper.succeed();
    }
    for (const segment of path) {
        const { value, range } = segment;
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
                        node = walker.getItem(node);
                        helper.merge(value.tag.validate(node, walker));
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
                if (node) {
                    if (isCompoundInfo(node)) {
                        const children = walker.getChildren(node);
                        if (range.end === cursor) {
                            helper.addSuggestions(
                                ...Object.keys(children)
                                    .filter(opt => opt.startsWith(value.string))
                                    .map<Suggestion>(v =>
                                        completionForString(
                                            v,
                                            range.start,
                                            {
                                                quote: true,
                                                unquoted: unquotedNBTStringRegex
                                            },
                                            CompletionItemKind.Field
                                        )
                                    )
                            );
                        }
                        if (children.hasOwnProperty(value.string)) {
                            node = children[value.string];
                        } else {
                            if (!node.node.additionalChildren) {
                                helper.addErrors(
                                    exceptions.INCORRECT_PROPERTY.create(
                                        range.start,
                                        range.end,
                                        value.string
                                    )
                                );
                            }
                            node = undefined;
                        }
                    } else {
                        const toDisplay = isTypedInfo(node)
                            ? node.node.type
                            : "unknown";
                        helper.addErrors(
                            exceptions.UNEXPECTED_PROPERTY.create(
                                range.start,
                                range.end,
                                toDisplay
                            )
                        );
                        node = undefined;
                    }
                }
                break;
            default:
        }
        if (
            cursor === segment.range.end &&
            node &&
            (isListInfo(node) ||
                (isTypedInfo(node) && typedArrayTypes.has(node.node.type)))
        ) {
            helper.addSuggestion(cursor, "[", CompletionItemKind.Operator);
        }
    }
    if (
        node &&
        expectedType &&
        !(isTypedInfo(node) && node.node.type === expectedType)
    ) {
        helper.addErrors(
            exceptions.WRONG_TYPE.create(
                path[0].range.start,
                path[path.length - 1].range.end,
                expectedType
            )
        );
    }
    return helper.succeed();
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
            const res = reader.readString(
                // = StringReader.charAllowedInUnquotedString without '\.'
                unquotedNBTStringRegex
            );
            range.end = reader.cursor;
            if (helper.merge(res)) {
                result.push({
                    range,
                    value: {
                        kind: SegmentKind.STRING,
                        string: res.data
                    }
                });
            } else {
                if (res.data !== undefined) {
                    result.push({
                        range,
                        value: {
                            kind: SegmentKind.STRING,
                            string: res.data
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
