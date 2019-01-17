import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ContextPath, ReturnHelper, startPaths } from "../../misc-functions";
import {
    CommandContext,
    ContextChange,
    LineRange,
    Parser,
    ParserInfo,
    Ranged,
    ReturnedInfo,
    ReturnSuccess
} from "../../types";
import { NBTIDInfo } from "./nbt/nbt";
import { parseAnyNBTTag } from "./nbt/tag-parser";
import { NBTTag } from "./nbt/tag/nbt-tag";
import { TypedNode } from "./nbt/util/doc-walker-util";
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
    INCORRECT_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.unknown",
        "Unknown segment '%s'"
    ),
    START_SEGMENT: new CommandErrorBuilder(
        "argument.nbt_path.array_start",
        "Cannot start an nbt path with an array reference"
    ),
    UNEXPECTED_ARRAY: new CommandErrorBuilder(
        "argument.nbt_path.unknown",
        "Path segment should not be array"
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
                ids: (c.otherEntity && c.otherEntity.ids) || "none",
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
// @ts-ignore It is unused - it is just here to record what we currently do not use
const unvalidatedPaths = [
    [
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
    ]
];
enum SuggestionKind {
    BOTH,
    KEYONLY
}
// These number and nbt ranges include the open and close []
// The string ranges do not include the .
type NbtPath = Array<Ranged<string | number | NBTTag>>;

export const nbtPathParser: Parser = {
    // tslint:disable-next-line:cyclomatic-complexity
    parse: (
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<ContextChange | undefined> => {
        const helper = new ReturnHelper();
        const out: NbtPath = [];
        let first = true;
        const pathFunc = startPaths(pathInfo, info.path);
        const context = pathFunc && pathFunc(info.context);
        while (true) {
            // Whitespace
            const start = reader.cursor;
            if (reader.peek() === ARROPEN) {
                const range: LineRange = { start, end: 0 };
                reader.skip();
                if (reader.peek() === COMPOUND_START) {
                    const val = parseAnyNBTTag(reader, []);
                    if (helper.merge(val)) {
                        out.push({ range, value: val.data.tag });
                    } else {
                        if (val.data) {
                            out.push({ range, value: val.data.tag });
                        }
                        range.end = reader.cursor;
                        helper.merge(
                            validatePath(info, out, context, undefined)
                        );
                        return helper.fail();
                    }
                } else {
                    const int = reader.readInt();
                    range.end = reader.cursor;
                    if (helper.merge(int)) {
                        out.push({ range, value: int.data });
                    } else {
                        range.end = reader.cursor;
                        helper.merge(
                            validatePath(info, out, context, undefined)
                        );
                        return helper.fail();
                    }
                }
                if (!helper.merge(reader.expect(ARRCLOSE))) {
                    range.end = reader.cursor;
                    helper.merge(validatePath(info, out, context, undefined));
                    return helper.fail();
                }
                range.end = reader.cursor;
            } else if ((!first && reader.peek() === DOT) || first) {
                if (!first) {
                    reader.skip();
                }
                const range: LineRange = { start: reader.cursor, end: 0 };
                const res = reader.readString(/^[0-9A-Za-z_\-+]$/);
                if (helper.merge(res)) {
                    out.push({ range, value: res.data });
                } else {
                    if (res.data !== undefined) {
                        range.end = reader.cursor;
                        out.push({ range, value: res.data });
                    }
                    helper.merge(
                        validatePath(
                            info,
                            out,
                            context,
                            res.data !== undefined
                                ? SuggestionKind.KEYONLY
                                : undefined
                        )
                    );
                    return helper.fail();
                }
                range.end = reader.cursor;
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
            if (!reader.canRead()) {
                const type = validatePath(
                    info,
                    out,
                    context,
                    SuggestionKind.BOTH
                );
                return helper.mergeChain(type).succeed({ nbt_path: type.data });
            }
            if (/\s/.test(reader.peek())) {
                const type = validatePath(info, out, context, undefined);
                if (context && type.data && context.resultType !== type.data) {
                    helper.addErrors(
                        exceptions.WRONG_TYPE.create(
                            start,
                            reader.cursor,
                            context.resultType as TypedNode["type"],
                            type.data
                        )
                    );
                }
                return helper.mergeChain(type).succeed({ nbt_path: type.data });
            }
        }
    }
};

function parseNBTPath(reader: StringReader): ReturnedInfo<NbtPath> {
    const helper = new ReturnHelper();
    const result: NbtPath = [];
    const first = true;
    while (true) {
        const segmentStart = reader.cursor;
        if (reader.peek() === ARROPEN) {
            const range: LineRange = { start: segmentStart, end: 0 };
            // Nbt in path
            if (reader.peek() === COMPOUND_START) {
                const val = parseAnyNBTTag(reader, []);
                if (helper.merge(val)) {
                    result.push({ range, value: val.data.tag });
                } else {
                    if (val.data) {
                        result.push({ range, value: val.data.tag });
                    }
                    range.end = reader.cursor;
                    return helper.fail();
                }
            }
        } else if ((!first && reader.peek() === DOT) || first) {
            if (!first) {
                // Skip the dot
                reader.skip();
            }
            // Exclude the . from the range
            const range: LineRange = { start: segmentStart, end: 0 };
            const res = reader.readString(/^[0-9A-Za-z_\-+]$/);
            if (helper.merge(res)) {
                result.push({ range, value: res.data });
            } else {
                if (res.data !== undefined) {
                    range.end = reader.cursor;
                    result.push({ range, value: res.data });
                }
                return helper.fail();
            }
            range.end = reader.cursor;
        } else {
            return helper.fail(
                exceptions.BAD_CHAR.create(
                    reader.cursor - 1,
                    reader.cursor,
                    reader.peek()
                )
            );
        }

        return helper.succeed(result);
    }
}

function validatePath(
    info: ParserInfo,
    // @ts-ignore Unused - TODO
    path: NbtPath,
    context: PathResult | undefined,
    // @ts-ignore Unused - TODO
    suggest: SuggestionKind | undefined
): ReturnSuccess<TypedNode["type"] | undefined> {
    const helper = new ReturnHelper();
    const walker = new NBTWalker(info.data.globalData.nbt_docs);
    if (context) {
        if (context.contextInfo) {
            // TODO
        }
    }
    walker.getInitialNode([]);
    return helper.succeed();
}
