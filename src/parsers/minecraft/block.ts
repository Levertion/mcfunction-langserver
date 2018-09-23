import {
    CompletionItemKind,
    DiagnosticSeverity
} from "vscode-languageserver/lib/main";

import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import {
    BlocksPropertyInfo,
    NamespacedName,
    SingleBlockPropertyInfo
} from "../../data/types";
import {
    namespaceSuggestionString,
    ReturnHelper,
    stringifyNamespace
} from "../../misc-functions";
import {
    buildTagActions,
    parseNamespaceOrTag
} from "../../misc-functions/parsing/nmsp-tag";
import { Parser, ParserInfo, ReturnedInfo, Suggestion } from "../../types";

export const predicateParser: Parser = {
    parse: (reader, info) => parseBlockArgument(reader, info, true)
};

export const stateParser: Parser = {
    parse: (reader, info) => parseBlockArgument(reader, info, false)
};

interface PropertyExceptions {
    duplicate: CommandErrorBuilder;
    invalid: CommandErrorBuilder;
    novalue: CommandErrorBuilder;
    unknown: CommandErrorBuilder;
}

const exceptions = {
    block_properties: {
        duplicate: new CommandErrorBuilder(
            "argument.block.property.duplicate",
            "Property '%s' can only be set once for block %s"
        ),
        invalid: new CommandErrorBuilder(
            "argument.block.property.invalid",
            "Block %s does not accept '%s' for %s property"
        ),
        novalue: new CommandErrorBuilder(
            "argument.block.property.novalue",
            "Expected value for property '%s' on block %s"
        ),
        unknown: new CommandErrorBuilder(
            "argument.block.property.unknown",
            "Block %s does not have property '%s'"
        )
    },
    invalid_block: new CommandErrorBuilder(
        "argument.block.id.invalid",
        "Unknown block type '%s'"
    ),
    no_tags: new CommandErrorBuilder(
        "argument.block.tag.disallowed",
        "Tags aren't allowed here, only actual blocks"
    ),
    tag_properties: {
        duplicate: new CommandErrorBuilder(
            "argument.block_tag.property.duplicate",
            "Property '%s' can only be set once for block tag %s"
        ),
        invalid: new CommandErrorBuilder(
            "argument.block_tag.property.invalid",
            "Block tag %s does not accept '%s' for %s property"
        ),
        novalue: new CommandErrorBuilder(
            "argument.block_tag.property.novalue",
            "Expected value for property '%s' on block tag %s"
        ),
        unknown: new CommandErrorBuilder(
            "argument.block_tag.property.unknown",
            "Block tag %s does not have property '%s'"
        )
    },
    unknown_properties: {
        duplicate: new CommandErrorBuilder(
            "argument.unknown_block_tag.property.duplicate",
            "Property '%s' can only be set once for unknown block tag %s"
        ),
        invalid: new CommandErrorBuilder(
            "argument.unknown_block_tag.property.invalid",
            "Unknown block tag %s might not accept '%s' for %s property",
            DiagnosticSeverity.Warning
        ),
        novalue: new CommandErrorBuilder(
            "argument.unknown_block_tag.property.novalue",
            "Expected value for property '%s' on unknown block tag %s"
        ),
        unknown: new CommandErrorBuilder(
            "argument.unknown_block_tag.property.unknown",
            "Unknown block tag %s might not have property '%s'",
            DiagnosticSeverity.Warning
        )
    },

    unclosed_props: new CommandErrorBuilder(
        "argument.block.property.unclosed",
        "Expected closing ] for block state properties"
    ),

    unknown_tag: new CommandErrorBuilder(
        "arguments.block.tag.unknown", // Argument_s_ [sic]
        "Unknown block tag '%s'"
    )
};

export function parseBlockArgument(
    reader: StringReader,
    info: ParserInfo,
    tags: boolean
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper(info);
    const start = reader.cursor;
    const tagHandling = tags ? "block_tags" : exceptions.no_tags;
    const parsed = parseNamespaceOrTag(reader, info, tagHandling);
    let stringifiedName: string | undefined;
    if (helper.merge(parsed)) {
        const parsedResult = parsed.data;
        if (parsedResult.resolved && parsedResult.values) {
            stringifiedName = `#${stringifyNamespace(parsedResult.parsed)}`;
            helper.merge(
                buildTagActions(
                    parsedResult.values,
                    start + 1,
                    reader.cursor,
                    "block_tags",
                    info.data.localData
                )
            );
            const props = constructProperties(
                parsedResult.resolved,
                info.data.globalData.blocks
            );
            const propsResult = parseProperties(
                reader,
                props || {},
                exceptions.tag_properties,
                stringifiedName
            );
            if (!helper.merge(propsResult)) {
                return helper.fail();
            }
        } else {
            stringifiedName = stringifyNamespace(parsed.data.parsed);
            if (info.suggesting && !reader.canRead()) {
                helper.addSuggestions(
                    ...namespaceSuggestionString(
                        Object.keys(info.data.globalData.blocks),
                        parsed.data.parsed,
                        start
                    )
                );
            }
            const props = info.data.globalData.blocks[stringifiedName];
            if (!props) {
                helper.addErrors(
                    exceptions.invalid_block.create(start, reader.cursor)
                );
            }
            const result = parseProperties(
                reader,
                props || {},
                exceptions.block_properties,
                stringifiedName
            );
            if (!helper.merge(result)) {
                return helper.fail();
            }
        }
    } else {
        if (parsed.data) {
            helper.addErrors(
                exceptions.unknown_tag.create(
                    start,
                    reader.cursor,
                    stringifyNamespace(parsed.data)
                )
            );
            stringifiedName = `#${stringifyNamespace(parsed.data)}`;
            const propsResult = parseProperties(
                reader,
                {},
                exceptions.unknown_properties,
                stringifiedName
            );
            if (!helper.merge(propsResult)) {
                return helper.fail();
            }
        } else {
            // Parsing of the namespace failed
            return helper.fail();
        }
    }
    return helper.succeed();
}

// Ugly call signature. Need to see how upstream handles tag properties.
// At the moment, it is very broken
function parseProperties(
    reader: StringReader,
    options: SingleBlockPropertyInfo,
    errors: PropertyExceptions,
    name: string
): ReturnedInfo<Map<string, string>> {
    const helper = new ReturnHelper();
    const result = new Map<string, string>();
    if (reader.peek() === "[") {
        const start = reader.cursor;
        reader.skip();
        const props = Object.keys(options);
        reader.skipWhitespace();
        while (reader.canRead() && reader.peek() !== "]") {
            reader.skipWhitespace();
            const propStart = reader.cursor;
            const propParse = reader.readOption(
                props,
                false,
                CompletionItemKind.Property
            );
            const propKey = propParse.data;
            const propSuccessful = helper.merge(propParse);
            if (propKey === false) {
                // Strange order allows better type checker reasoning
                // Parsing failed
                return helper.fail();
            }
            if (!propSuccessful) {
                helper.addErrors(
                    errors.unknown.create(
                        propStart,
                        reader.cursor,
                        name,
                        propKey
                    )
                );
            }
            if (result.has(propKey)) {
                helper.addErrors(
                    errors.duplicate.create(
                        propStart,
                        reader.cursor,
                        propKey,
                        name
                    )
                );
            }
            reader.skipWhitespace();
            if (!reader.canRead() || reader.peek() !== "=") {
                return helper.fail(
                    errors.novalue.create(
                        propStart,
                        reader.cursor,
                        propKey,
                        name
                    )
                );
            }
            reader.skip();
            reader.skipWhitespace();
            const valueStart = reader.cursor;
            const valueParse = reader.readOption(
                options[propKey] || [],
                false,
                CompletionItemKind.EnumMember
            );
            const valueSuccessful = helper.merge(valueParse);
            const value = valueParse.data;
            if (value === false) {
                return helper.fail();
            }
            const error = errors.invalid.create(
                valueStart,
                reader.cursor,
                name,
                value,
                propKey
            );
            const adderrorIf = (b: boolean) =>
                b && propSuccessful && !valueSuccessful
                    ? helper.addErrors(error)
                    : undefined;
            adderrorIf(value.length > 0);
            result.set(propKey, value);
            reader.skipWhitespace();
            if (reader.canRead()) {
                if (reader.peek() === ",") {
                    adderrorIf(value.length === 0);
                    reader.skip();
                    continue;
                }
                if (reader.peek() === "]") {
                    adderrorIf(value.length === 0);
                    break;
                }
            }
            return helper.fail(
                exceptions.unclosed_props.create(start, reader.cursor)
            );
        }
        if (!reader.canRead()) {
            helper.addSuggestions(
                ...props.map<Suggestion>(prop => ({
                    kind: CompletionItemKind.Property,
                    start: reader.cursor,
                    text: prop
                }))
            );
            return helper.fail(
                exceptions.unclosed_props.create(start, reader.cursor)
            );
        }
        reader.expect("]"); // Sanity check
    }
    return helper.succeed(result);
}

function constructProperties(
    options: NamespacedName[],
    blocks: BlocksPropertyInfo
): SingleBlockPropertyInfo {
    const result: SingleBlockPropertyInfo = {};
    for (const blockName of options) {
        const stringified = stringifyNamespace(blockName);
        const block = blocks[stringified];
        if (block) {
            for (const prop in block) {
                if (block.hasOwnProperty(prop)) {
                    result[prop] = Array.from(
                        new Set((result[prop] || []).concat(block[prop]))
                    );
                }
            }
        }
    }
    return result;
}
