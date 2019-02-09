import { CompletionItemKind } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import { Resources } from "../../data/types";
import {
    buildPath,
    buildTagActions,
    ContextPath,
    getResourcesofType,
    parseNamespace,
    parseNamespaceOption,
    parseNamespaceOrTag,
    prepareForParser,
    processParsedNamespaceOption,
    ReturnHelper,
    startPaths,
    stringArrayToNamespaces,
    stringifyNamespace
} from "../../misc-functions";
import { Parser } from "../../types";

const exceptions = {
    advancement_notfound: new CommandErrorBuilder(
        "advancement.advancementNotFound",
        "Unknown advancement: %s"
    ),
    nobossbar: new CommandErrorBuilder(
        "commands.bossbar.unknown",
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
    unknown_loot: new CommandErrorBuilder(
        "argument.loot_table.unknown",
        "Unkown loot table '%s'"
    ),
    unknown_tag: new CommandErrorBuilder(
        "arguments.function.tag.unknown",
        "Unknown function tag '#%s'"
    )
};

export const functionParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        const start = reader.cursor;
        const parsed = parseNamespaceOrTag(reader, info, "function_tags");
        const localData = info.data.localData;
        if (helper.merge(parsed)) {
            const data = parsed.data;
            if (data.resolved && data.values) {
                helper.merge(
                    buildTagActions(
                        data.values,
                        start,
                        reader.cursor,
                        "function_tags",
                        localData
                    )
                );
                return helper.succeed();
            } else {
                const options = getResourcesofType(info.data, "functions");
                const postProcess = processParsedNamespaceOption(
                    data.parsed,
                    options,
                    info.suggesting && !reader.canRead(),
                    start,
                    CompletionItemKind.Method
                );
                if (postProcess.data.length === 0) {
                    helper.addErrors(
                        exceptions.unknown_function.create(
                            start,
                            reader.cursor,
                            stringifyNamespace(data.parsed)
                        )
                    );
                }
                if (localData) {
                    for (const func of postProcess.data) {
                        const location = buildPath(
                            func,
                            localData,
                            "functions"
                        );
                        if (location) {
                            helper.addActions({
                                data: location,
                                high: reader.cursor,
                                low: start,
                                type: "source"
                            });
                        }
                    }
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
    parse: (reader, info) => prepareForParser(parseNamespace(reader), info)
};

const bossbarParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper(info);
        if (info.data.localData && info.data.localData.nbt.level) {
            const start = reader.cursor;
            const bars = info.data.localData.nbt.level.Data.CustomBossEvents;
            const options = stringArrayToNamespaces(Object.keys(bars));
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
            // tslint:disable-next-line:helper-return
            return prepareForParser(
                helper.return(parseNamespace(reader)),
                info
            );
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
    },
    {
        data: {
            issue: exceptions.unknown_loot,
            resource: "loot_tables"
        },
        path: ["loot"]
    }
];

export const resourceParser: Parser = {
    parse: (reader, info) => {
        const start = reader.cursor;
        const helper = new ReturnHelper(info);
        const kind = startPaths(resourceKinds, info.path);
        if (kind) {
            if (typeof kind.resource === "object") {
                return helper.return(kind.resource.parse(reader, info));
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
