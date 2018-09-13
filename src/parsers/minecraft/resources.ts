import { CompletionItemKind } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { Resources } from "../../data/types";
import {
    ContextPath,
    convertToNamespace,
    getResourcesofType,
    parseNamespace,
    parseNamespaceOption,
    parseNamespaceOrTag,
    processParsedNamespaceOption,
    ReturnHelper,
    startPaths,
    stringifyNamespace
} from "../../misc-functions";
import { Parser } from "../../types";

const exceptions = {
    advancement_notfound: new CommandErrorBuilder(
        "advancement.advancementNotFound",
        "Unknown advancement: %s"
    ),
    nobossbar: new CommandErrorBuilder(
        "",
        "No bossbar exists with the ID '%s'"
    ),
    recipe_notfound: new CommandErrorBuilder(
        "recipe.notFound",
        "Unkown recipe: %s"
    ),
    unknown_function: new CommandErrorBuilder(
        "arguments.function.unknown",
        "Unknown function '%s'"
    ),
    unknown_resource: new CommandErrorBuilder(
        "argument.id.unknown",
        "Unknown resource '%s'"
    ),
    unknown_tag: new CommandErrorBuilder(
        "arguments.function.tag.unknown",
        "Unknown function tag '#%s'"
    )
};

export const functionParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const options = getResourcesofType(info.data, "functions");
        const parsed = parseNamespaceOrTag(reader, info, "function_tags");
        if (helper.merge(parsed)) {
            const data = parsed.data;
            if (data.resolved && data.values) {
                return helper.succeed();
            } else {
                const postProcess = processParsedNamespaceOption(
                    data.parsed,
                    options,
                    info.suggesting && !reader.canRead(),
                    start,
                    CompletionItemKind.Method
                );
                if (postProcess.data.length === 0) {
                    helper.addErrors(
                        exceptions.unknown_tag.create(
                            start,
                            reader.cursor,
                            stringifyNamespace(data.parsed)
                        )
                    );
                }
                return helper.mergeChain(postProcess).succeed();
            }
        } else {
            if (!parsed.data) {
                return helper.fail();
            } else {
                return helper
                    .addErrors(
                        exceptions.unknown_tag.create(
                            start,
                            reader.cursor,
                            stringifyNamespace(parsed.data)
                        )
                    )
                    .succeed();
            }
        }
    }
};

const idParser: Parser = {
    parse: parseNamespace
};

const bossbarParser: Parser = {
    parse: (reader, info) => {
        if (info.data.localData && info.data.localData.nbt.level) {
            const start = reader.cursor;
            const helper = new ReturnHelper();
            const bars = info.data.localData.nbt.level.Data.CustomBossEvents;
            const options = Object.keys(bars).map((v, _) =>
                convertToNamespace(v)
            );
            const result = parseNamespaceOption(reader, options);
            if (helper.merge(result)) {
                return helper.succeed();
            } else {
                if (result.data) {
                    return helper
                        .addErrors(
                            exceptions.nobossbar.create(
                                start,
                                reader.cursor,
                                stringifyNamespace(result.data)
                            )
                        )
                        .succeed();
                } else {
                    return helper.fail();
                }
            }
        } else {
            return parseNamespace(reader);
        }
    }
};

const resourceKinds: Array<
    ContextPath<
        | {
              issue: CommandErrorBuilder;
              resource: keyof Resources;
          }
        | { resource: Parser }
    >
> = [
    {
        data: {
            issue: exceptions.advancement_notfound,
            resource: "advancements"
        },
        path: ["advancement"]
    },
    { data: { resource: idParser }, path: ["bossbar", "add"] },
    { data: { resource: bossbarParser }, path: ["bossbar"] },
    {
        data: { resource: bossbarParser },
        path: ["execute", "store", "result"]
    },
    // Worrying about sounds is not in scope for initial release
    { data: { resource: idParser }, path: ["playsound"] },
    { data: { resource: idParser }, path: ["stopsound"] },
    {
        data: { resource: "recipes", issue: exceptions.advancement_notfound },
        path: ["recipe"]
    }
];

export const resourceParser: Parser = {
    parse: (reader, info) => {
        const start = reader.cursor;
        const helper = new ReturnHelper(info);
        const kind = startPaths(resourceKinds, info.path);
        if (kind) {
            if (typeof kind.resource === "object") {
                return kind.resource.parse(reader, info);
            } else {
                const result = parseNamespaceOption(
                    reader,
                    getResourcesofType(info.data, kind.resource)
                );
                if (helper.merge(result)) {
                    return helper.succeed();
                } else {
                    if (result.data) {
                        return helper
                            .addErrors(
                                // @ts-ignore type inference failure
                                (kind.issue as CommandErrorBuilder).create(
                                    start,
                                    reader.cursor,
                                    stringifyNamespace(result.data)
                                )
                            )
                            .succeed();
                    } else {
                        return helper.fail();
                    }
                }
            }
        } else {
            throw new Error(
                `Resource at path ${
                    info.path
                } does not have a supported resource`
            );
        }
    }
};
