import { CompletionItemKind } from "vscode-languageserver";
import { CommandErrorBuilder } from "../../brigadier/errors";
import {
    getResourcesofType,
    parseNamespaceOrTag,
    processParsedNamespaceOption,
    ReturnHelper,
    stringifyNamespace
} from "../../misc-functions";
import { Parser } from "../../types";

const exceptions = {
    unknown_function: new CommandErrorBuilder(
        "arguments.function.unknown",
        "Unknown function '%s'"
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
                return helper.fail(
                    exceptions.unknown_tag.create(
                        start,
                        reader.cursor,
                        stringifyNamespace(parsed.data)
                    )
                );
            }
        }
    }
};
