import { CompletionItemKind } from "vscode-languageserver/lib/main";

import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { TAG_START } from "../../consts";
import { ReturnHelper, stringifyID } from "../../misc-functions";
import { ID, Parser, ParserInfo, ReturnedInfo } from "../../types";

import { validateParse } from "./nbt/nbt";

export const predicateParser: Parser = {
    parse: (reader, info) => parseBlockArgument(reader, info, true)
};

export const stateParser: Parser = {
    parse: (reader, info) => parseBlockArgument(reader, info, false)
};

interface PropertyExceptions {
    duplicate: CommandErrorBuilder;
    invalid?: CommandErrorBuilder;
    novalue?: CommandErrorBuilder;
    unknown?: CommandErrorBuilder;
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
            "Property '%s' can only be set once for unrecognised block tag '%s'"
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

// tslint:disable:cyclomatic-complexity
export function parseBlockArgument(
    reader: StringReader,
    info: ParserInfo,
    tags: boolean
): ReturnedInfo<undefined> {
    const helper = new ReturnHelper(info);
    const start = reader.cursor;
    const properties: Map<string, Set<string>> = new Map();
    const ids: ID[] = [];
    let parseBlocks = true;
    let knownTag = false;
    // Always reassigned - used for tag error reporting
    let fullName = "";
    if (reader.peek() === TAG_START) {
        parseBlocks = false;
        reader.skip();
        if (!tags) {
            helper.addErrors(exceptions.no_tags.create(start, reader.cursor));
            // Error case - we continue parsing as if the # wasn't there
            parseBlocks = true;
        } else {
            const result = info.data.resources.block_tags.parse(
                reader,
                info.data
            );
            if (helper.merge(result)) {
                knownTag = true;
                fullName = `#${stringifyID(result.data.id)}`;
                for (const [id] of result.data.resolved.finals) {
                    ids.push(id);
                    const block = info.data.blocks.get(id);
                    if (block) {
                        mergeProps(properties, block);
                    }
                }
            } else {
                fullName = `#${stringifyID(result.data)}`;
                helper.addErrors(
                    exceptions.unknown_tag.create(
                        start,
                        reader.cursor,
                        fullName
                    )
                );
            }
        }
    }
    if (parseBlocks) {
        const result = info.data.blocks.parse(reader, undefined);
        if (helper.merge(result)) {
            fullName = stringifyID(result.data.id);
            for (const [key, value] of result.data.raw) {
                // Properties is never otherwise edited, so this does not lose data
                properties.set(key, value);
            }
            ids.push(result.data.id);
        } else {
            fullName = stringifyID(result.data);
            helper.addErrors(
                exceptions.invalid_block.create(start, reader.cursor, fullName)
            );
        }
    }

    const propsResult = parseProperties(
        reader,
        properties,
        parseBlocks
            ? exceptions.block_properties
            : knownTag
            ? exceptions.tag_properties
            : exceptions.unknown_properties,
        fullName
    );
    if (!helper.merge(propsResult)) {
        return helper.fail();
    }

    if (reader.peek() === "{") {
        const nbt = validateParse(reader, info, {
            // tslint:disable-next-line:no-unnecessary-callback-wrapper
            ids: ids.map(v => stringifyID(v)),
            kind: "block"
        });
        if (!helper.merge(nbt)) {
            return helper.fail();
        }
    } else {
        helper.addSuggestion(reader.cursor, "{");
    }
    return helper.succeed();
}

function mergeProps(
    current: Map<string, Set<string>>,
    additions: Map<string, Set<string>>
): void {
    for (const [key, value] of additions) {
        const set = current.get(key);
        if (typeof set === "undefined") {
            current.set(key, value);
        } else {
            for (const propValue of value) {
                set.add(propValue);
            }
        }
    }
}

// Ugly call signature. Need to see how upstream handles tag properties.
// At the moment, it is very broken
function parseProperties(
    reader: StringReader,
    options: Map<string, Set<string>>,
    errors: PropertyExceptions,
    name: string
): ReturnedInfo<Map<string, string>> {
    const helper = new ReturnHelper();
    const result = new Map<string, string>();
    const start = reader.cursor;
    if (helper.merge(reader.expect("["), { errors: false })) {
        const props = [...options.keys()];
        reader.skipWhitespace();
        if (helper.merge(reader.expectOption("]"), { errors: false })) {
            return helper.succeed(result);
        }
        while (true) {
            reader.skipWhitespace();
            const propStart = reader.cursor;
            const isUnclosed = !reader.canRead();
            const propParse = reader.readOption(
                props,
                undefined,
                CompletionItemKind.Property
            );
            const propKey = propParse.data;
            const propSuccessful = helper.merge(propParse);
            if (propKey === undefined) {
                // Strange order allows better type checker reasoning
                // Parsing failed
                return helper.fail();
            }
            if (isUnclosed) {
                return helper.fail(
                    exceptions.unclosed_props.create(start, reader.cursor)
                );
            }
            if (!propSuccessful && errors.unknown) {
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
            if (!helper.merge(reader.expect("="), { errors: false })) {
                return helper.fail(
                    errors.novalue &&
                        errors.novalue.create(
                            propStart,
                            reader.cursor,
                            propKey,
                            name
                        )
                );
            }
            reader.skipWhitespace();
            const valueStart = reader.cursor;
            const valueParse = reader.readOption(
                [...(options.get(propKey) || [])],
                undefined,
                CompletionItemKind.EnumMember
            );
            const valueSuccessful = helper.merge(valueParse);
            const value = valueParse.data;
            if (value === undefined) {
                return helper.fail();
            }
            const error =
                (errors.invalid && [
                    errors.invalid.create(
                        valueStart,
                        reader.cursor,
                        name,
                        value,
                        propKey
                    )
                ]) ||
                [];
            const adderrorIf = (b: boolean) =>
                b && propSuccessful && !valueSuccessful
                    ? helper.addErrors(...error)
                    : undefined;
            adderrorIf(value.length > 0);
            result.set(propKey, value);
            reader.skipWhitespace();
            if (helper.merge(reader.expect(","), { errors: false })) {
                adderrorIf(value.length === 0);
                continue;
            }
            if (helper.merge(reader.expect("]"), { errors: false })) {
                adderrorIf(value.length === 0);
                return helper.succeed(result);
            }
            return helper.fail(
                exceptions.unclosed_props.create(start, reader.cursor)
            );
        }
    }
    return helper.succeed(result);
}
