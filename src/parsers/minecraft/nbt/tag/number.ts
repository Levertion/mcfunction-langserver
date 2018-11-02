import { CommandErrorBuilder } from "../../../../brigadier/errors";
import { StringReader } from "../../../../brigadier/string-reader";
import { isSuccessful, ReturnHelper } from "../../../../misc-functions";
import { typed_keys } from "../../../../misc-functions/third_party/typed-keys";
import { ReturnSuccess } from "../../../../types";
import { isTypedInfo, NodeInfo } from "../util/doc-walker-util";
import { Correctness, tryExponential } from "../util/nbt-util";
import { NBTTag, ParseReturn } from "./nbt-tag";

const exceptions = {
    FLOAT: new CommandErrorBuilder(
        "argument.nbt.number.float",
        "%s is not a float type, but the given text is a float"
    ),
    SUFFIX: new CommandErrorBuilder(
        "argument.nbt.number.suffix",
        "Expected suffix '%s' for %s, got %s"
    ),
    TOO_BIG: new CommandErrorBuilder(
        "argument.nbt.number.big",
        "%s must not be more than %s, found %s"
    ),
    TOO_LOW: new CommandErrorBuilder(
        "argument.nbt.number.low",
        "%s must not be less than %s, found '%s'"
    )
};

export type NumberType = "float" | "double" | "short" | "int" | "byte" | "long";
interface NumberInfo {
    float: boolean;
    max: number;
    min: number;
    suffix: string;
}

const intnumberInfo = (pow: number, suffix: string): NumberInfo => ({
    float: false,
    max: 2 ** pow - 1,
    min: -(2 ** pow),
    suffix
});

const ranges: { [type in NumberType]: NumberInfo } = {
    byte: intnumberInfo(7, "b"),
    // tslint:disable:binary-expression-operand-order
    double: {
        float: true,
        max: 1.8 * 10 ** 308, // Approx
        min: -1.8 * 10 ** 308,
        suffix: "d"
    },
    float: {
        float: true,
        max: 3.4 * 10 ** 38, // Approx
        min: -3.4 * 10 ** 38,
        suffix: "d"
    },
    // tslint:enable:binary-expression-operand-order
    int: intnumberInfo(31, ""),
    long: intnumberInfo(63, "l"),
    short: intnumberInfo(15, "b")
};

function typeForSuffix(rawsuffix: string): NumberInfo | undefined {
    const suffix = rawsuffix.toLowerCase();
    for (const type of typed_keys(ranges)) {
        if (ranges[type].suffix === suffix) {
            return ranges[type];
        }
    }
    return undefined;
}

export class NBTTagNumber extends NBTTag {
    protected tagType = undefined;
    protected value = 0;
    private float = false;
    private suffix: string | undefined;

    public getValue(): number {
        return this.value;
    }

    public readTag(reader: StringReader): ParseReturn {
        const helper = new ReturnHelper();
        const start = reader.cursor;
        const exp = tryExponential(reader);
        if (helper.merge(exp)) {
            this.float = true;
            this.value = exp.data;
            this.checkSuffix(reader);
            return helper.succeed(Correctness.CERTAIN);
        }
        reader.cursor = start;
        const int = reader.readInt();
        if (isSuccessful(int)) {
            helper.merge(int);
            this.value = int.data;
            this.checkSuffix(reader);
            return helper.succeed(Correctness.CERTAIN);
        }
        reader.cursor = start;
        const float = reader.readFloat();
        if (helper.merge(float)) {
            this.float = true;
            this.value = float.data;
            this.checkSuffix(reader);
            return helper.succeed(Correctness.CERTAIN);
        } else {
            return helper.failWithData(Correctness.NO);
        }
    }

    public setValue(val: number): this {
        this.value = val;
        return this;
    }

    // HERE BE DRAGONS:
    // Unhandled special cases abound!
    // Contributions welcome, at yer own risk
    public validate(node: NodeInfo): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        if (isTypedInfo(node)) {
            const actualType = node.node.type;
            if (!ranges.hasOwnProperty(actualType)) {
                return helper.mergeChain(this.sameType(node)).succeed();
            }
            const typeInfo = ranges[actualType as NumberType];
            if (typeInfo.min > this.value) {
                helper.addErrors(
                    exceptions.TOO_LOW.create(
                        this.range.start,
                        this.range.end,
                        actualType,
                        typeInfo.min.toString(),
                        this.value.toString()
                    )
                );
            } else if (typeInfo.max < this.value) {
                helper.addErrors(
                    exceptions.TOO_BIG.create(
                        this.range.start,
                        this.range.end,
                        actualType,
                        typeInfo.min.toString(),
                        this.value.toString()
                    )
                );
            }
            if (this.float && !typeInfo.float) {
                helper.addErrors(
                    exceptions.FLOAT.create(
                        this.range.start,
                        this.range.end,
                        actualType
                    )
                );
            }
            if (this.suffix && this.suffix !== typeInfo.suffix) {
                helper.addErrors(
                    exceptions.SUFFIX.create(
                        this.range.end - 1,
                        this.range.end,
                        typeInfo.suffix,
                        actualType,
                        this.suffix
                    )
                );
            }
            return helper.succeed();
        } else {
            // Will always add the error in this case
            return helper.mergeChain(this.sameType(node)).succeed();
        }
    }

    private checkSuffix(reader: StringReader): void {
        // Not convinced that this is correct
        if (reader.canRead()) {
            const suffix = reader.peek();
            const type = typeForSuffix(suffix);
            if (type) {
                this.suffix = suffix;
            }
        }
    }
}
