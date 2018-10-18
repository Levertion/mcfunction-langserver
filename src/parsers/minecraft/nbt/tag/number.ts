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

type NumberType = "float" | "double" | "short" | "int" | "byte" | "long";

const ranges: {
    [type in NumberType]: {
        float: boolean;
        max: number;
        min: number;
        suffix: string; // === type[0] for all
    }
} = {
    byte: { min: 0, max: 7, float: false, suffix: "b" },
    double: { min: 0, max: 7, float: true, suffix: "d" },
    float: { min: 0, max: 7, float: true, suffix: "f" },
    int: { min: 0, max: 7, float: false, suffix: "i" },
    long: { min: 0, max: 7, float: false, suffix: "l" },
    short: { min: 0, max: 7, float: false, suffix: "s" }
};

export class NBTTagNumber extends NBTTag {
    public value: number | undefined;
    protected tagType: NumberType = "byte";
    private float = false;
    private suffix: string | undefined;

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
            return helper.succeed(Correctness.NO);
        }
    }

    public validate(node: NodeInfo): ReturnSuccess<undefined> {
        const helper = new ReturnHelper();
        if (isTypedInfo(node) && this.value !== undefined) {
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
            for (const key of typed_keys(ranges)) {
                if (ranges[key].suffix === suffix) {
                    this.suffix = suffix;
                    reader.skip();
                    break;
                }
            }
        }
    }
}
