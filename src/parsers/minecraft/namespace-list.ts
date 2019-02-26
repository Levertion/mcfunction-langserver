import { CommandErrorBuilder } from "../../brigadier/errors";
import { StringReader } from "../../brigadier/string-reader";
import { ID, RegistryNames } from "../../data/types";
import {
    parseNamespaceOption,
    ReturnHelper,
    stringArrayToIDs,
    stringifyID
} from "../../misc-functions";
import { CommandContext, Parser, ParserInfo, ReturnedInfo } from "../../types";

export class NamespaceListParser implements Parser {
    private readonly error: CommandErrorBuilder;
    private readonly registryType: RegistryNames;
    private readonly resultFunction?: (
        context: CommandContext,
        result: ID[]
    ) => void;
    public constructor(
        registryType: RegistryNames,
        errorBuilder: CommandErrorBuilder,
        context?: NamespaceListParser["resultFunction"]
    ) {
        this.registryType = registryType;
        this.error = errorBuilder;
        this.resultFunction = context;
    }
    public parse(
        reader: StringReader,
        info: ParserInfo
    ): ReturnedInfo<undefined> {
        const helper = new ReturnHelper(info);
        const start = reader.cursor;
        const result = parseNamespaceOption(
            reader,
            stringArrayToIDs([
                ...info.data.globalData.registries[this.registryType]
            ])
        );
        if (helper.merge(result)) {
            if (this.resultFunction) {
                this.resultFunction(info.context, result.data.values);
                return helper.succeed();
            } else {
                return helper.succeed();
            }
        } else {
            if (result.data) {
                return helper
                    .addErrors(
                        this.error.create(
                            start,
                            reader.cursor,
                            stringifyID(result.data)
                        )
                    )
                    .succeed();
            } else {
                return helper.fail();
            }
        }
    }
}

export const summonError = new CommandErrorBuilder(
    "entity.notFound",
    "Unknown entity: %s"
);
export const summonParser = new NamespaceListParser(
    "minecraft:entity_type",
    summonError,
    (context, ids) => (context.otherEntity = { ids })
);

const enchantmentError = new CommandErrorBuilder(
    "enchantment.unknown",
    "Unknown enchantment: %s"
);
export const enchantmentParser = new NamespaceListParser(
    "minecraft:enchantment",
    enchantmentError
);

const mobEffectError = new CommandErrorBuilder(
    "effect.effectNotFound",
    "Unknown effect: %s"
);
export const mobEffectParser = new NamespaceListParser(
    "minecraft:mob_effect",
    mobEffectError
);

const particleError = new CommandErrorBuilder(
    "particle.notFound",
    "Unknown particle: %s"
);
export const particleParser = new NamespaceListParser(
    "minecraft:particle_type",
    particleError
);

const dimensionError = new CommandErrorBuilder(
    "argument.dimension.invalid",
    "Unknown dimension: '%s'"
);

export const dimensionParser = new NamespaceListParser(
    "minecraft:dimension_type",
    dimensionError
);
