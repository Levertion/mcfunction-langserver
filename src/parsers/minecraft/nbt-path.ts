import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ContextPath, ReturnHelper, startPaths } from "../../misc-functions";
import {
    CommandContext,
    ContextChange,
    Parser,
    ParserInfo,
    ReturnedInfo
} from "../../types";
import { parseThenValidate } from "./nbt/nbt";
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

const entityDataPath = (
    path: string[]
): ContextPath<(context: CommandContext) => PathResult> => ({
    data: c => ({
        startPath: ["entity"].concat(
            (c.otherEntity && c.otherEntity.ids) || "none"
        )
    }),
    path
});

interface PathResult {
    resultType?: TypedNode["type"];
    startPath: string[];
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
        // Todo, add resultType
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
        // Todo, add resultType
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
// @ts-ignore It is unused - it is just here for posterity/to record what we currently use
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

export const parser: Parser = {
    // tslint:disable-next-line:cyclomatic-complexity
    parse: (
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<ContextChange | undefined> => {
        const helper = new ReturnHelper();
        const out: Array<string | number> = [];
        const walker = new NBTWalker(info.data.globalData.nbt_docs);
        let first = true;
        const pathFunc = startPaths(pathInfo, info.path);
        const context = pathFunc && pathFunc(info.context);
        let current: NodeInfo | undefined = context
            ? walker.getInitialNode(context.startPath)
            : undefined;
        while (true) {
            // Whitespace
            const start = reader.cursor;
            if (reader.peek() === ARROPEN) {
                reader.skip();
                if (reader.peek() === COMPOUND_START) {
                    const val = parseThenValidate(reader, walker, current);
                    if (helper.merge(val)) {
                        out.push(0);
                    } else {
                        return helper.fail();
                    }
                } else {
                    const int = reader.readInt();
                    if (helper.merge(int)) {
                        out.push(int.data);
                    } else {
                        return helper.fail();
                    }
                }
                if (!helper.merge(reader.expect(ARRCLOSE))) {
                    return helper.fail();
                }
                if (current) {
                    if (isListInfo(current)) {
                        current = walker.getItem(current);
                    } else {
                        helper.addErrors(
                            exceptions.UNEXPECTED_ARRAY.create(
                                start,
                                reader.cursor
                            )
                        );
                        current = undefined;
                    }
                }
                continue;
            }
            if ((!first && reader.peek() === DOT) || first) {
                if (!first) {
                    reader.skip();
                }
                const children =
                    current && isCompoundInfo(current)
                        ? walker.getChildren(current)
                        : {};
                const res = reader.readOption(Object.keys(children));
                if (helper.merge(res)) {
                    current = children[res.data];
                } else {
                    if (res.data) {
                        if (current) {
                            helper.addErrors(
                                exceptions.INCORRECT_SEGMENT.create(
                                    start,
                                    reader.cursor,
                                    res.data
                                )
                            );
                        }
                    } else {
                        return helper.fail();
                    }
                    current = undefined;
                }
                continue;
            }
            if (!reader.canRead()) {
                if (!first && (!current || isCompoundInfo(current))) {
                    helper.addSuggestion(reader.cursor, ".");
                }
                if (!current || isListInfo(current)) {
                    helper.addSuggestion(reader.cursor, "[");
                }
            }
            first = false;
            if (/\s/.test(reader.peek())) {
                if (
                    current &&
                    context &&
                    context.resultType &&
                    isTypedInfo(current)
                ) {
                    if (current.node.type !== context.resultType) {
                        helper.addErrors(
                            exceptions.WRONG_TYPE.create(
                                start,
                                reader.cursor,
                                context.resultType,
                                current.node.type
                            )
                        );
                    }
                }
                return helper.succeed();
            }
            return helper.fail(
                exceptions.BAD_CHAR.create(
                    reader.cursor - 1,
                    reader.cursor,
                    reader.peek()
                )
            );
        }
    }
};
