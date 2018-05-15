import { ReturnHelper } from "../misc_functions";
import { typed_keys } from "../misc_functions/third_party/typed_keys";
import { CE, ReturnedInfo, Suggestion } from "../types";
import { CommandErrorBuilder } from "./errors";

const EXCEPTIONS = {
    EXPECTED_BOOL: new CommandErrorBuilder("parsing.bool.expected", "Expected bool"),
    EXPECTED_END_OF_QUOTE: new CommandErrorBuilder("parsing.quote.expected.end",
        "Unclosed quoted string"),
    EXPECTED_FLOAT: new CommandErrorBuilder("parsing.float.expected", "Expected float"),
    EXPECTED_INT: new CommandErrorBuilder("parsing.int.expected", "Expected integer"),
    EXPECTED_START_OF_QUOTE: new CommandErrorBuilder("parsing.quote.expected.start",
        "Expected quote to start a string"),
    EXPECTED_STRING_FROM: new CommandErrorBuilder("parsing.expected.option", "Expected string from %s, got '%s'"),
    EXPECTED_SYMBOL: new CommandErrorBuilder("parsing.expected", "Expected '%s'"),
    INVALID_BOOL: new CommandErrorBuilder("parsing.bool.invalid",
        "Invalid bool, expected true or false but found '%s'"),
    INVALID_ESCAPE: new CommandErrorBuilder("parsing.quote.escape",
        "Invalid escape sequence '\\%s' in quoted string)"),
    INVALID_FLOAT: new CommandErrorBuilder("parsing.float.invalid", "Invalid float '%s'"),
    INVALID_INT: new CommandErrorBuilder("parsing.int.invalid", "Invalid integer '%s'"),
};

const QUOTE = "\"";
const ESCAPE = "\\";

export class StringReader {
    public static charAllowedNumber = /^[0-9\-\.]$/;
    public static charAllowedInUnquotedString = /^[0-9A-Za-z_\-\.+]$/;
    public static isWhiteSpace(char: string) {
        return char === "\n" || char === "\t";
    }
    private static bools = { true: true, false: false };
    public cursor: number = 0;
    public readonly string: string;

    constructor(stringToRead: string) {
        this.string = stringToRead;
    }

    public getRead() {
        return this.string.substring(0, this.cursor);
    }
    public getRemaining() {
        return this.string.substring(this.cursor);
    }
    public getRemainingLength(): number {
        return this.string.length - this.cursor;
    }
    public getTotalLength(): number {
        return this.string.length;
    }
    public canRead(length = 1) {
        return this.cursor + length <= this.string.length;
    }
    public peek(offset = 0) {
        return this.string.charAt(this.cursor + offset);
    }
    public skip() {
        this.cursor++;
    }
    public read(): string {
        return this.string.charAt(this.cursor++);
    }
    public skipWhitespace() {
        this.readWhileRegexp(/\s/); // Whitespace
    }
    /**
     * Read an integer from the string
     */
    public readInt(): ReturnedInfo<number> {
        const helper = new ReturnHelper();
        const start: number = this.cursor;
        const readToTest: string = this.readWhileRegexp(StringReader.charAllowedNumber);
        if (readToTest.length === 0) {
            return helper.fail(EXCEPTIONS.EXPECTED_INT.create(start, this.string.length));
        }
        // The Java readInt crashes upon a `.`, but the regex includes one in brigadier
        if (readToTest.indexOf(".") !== -1) {
            return helper.fail(EXCEPTIONS.INVALID_INT.create(start, this.cursor,
                this.string.substring(start, this.cursor)));
        }
        try {
            return helper.succeed(Number.parseInt(readToTest, 10));
        } catch (error) {
            return helper.fail(EXCEPTIONS.INVALID_INT.create(start, this.cursor, readToTest));
        }
    }
    /**
     * Read a from the string
     */
    public readFloat(): ReturnedInfo<number> {
        const helper = new ReturnHelper();
        const start: number = this.cursor;
        const readToTest: string = this.readWhileRegexp(StringReader.charAllowedNumber);
        if (readToTest.length === 0) {
            return helper.fail(EXCEPTIONS.EXPECTED_FLOAT.create(start, this.string.length));
        }
        try {
            return helper.succeed(parseFloat(readToTest));
        } catch (error) {
            return helper.fail(EXCEPTIONS.EXPECTED_INT.create(start, this.cursor, readToTest));
        }
    }
    /**
     * Read a string which is not surrounded by quotes.
     * Can only contain alphanumerical characters, _,+,. and -
     */
    public readUnquotedString() {
        return this.readWhileRegexp(StringReader.charAllowedInUnquotedString);
    }
    /**
     * Read from the string, returning a string, which, in the original had been surrounded by quotes
     */
    public readQuotedString(): ReturnedInfo<string> {
        const helper = new ReturnHelper();
        const start = this.cursor;
        if (!this.canRead()) {
            return helper.succeed("");
        }
        if (this.peek() !== QUOTE) {
            return helper.fail(EXCEPTIONS.EXPECTED_START_OF_QUOTE.create(this.cursor, this.string.length));
        }
        let result: string = "";
        let escaped: boolean = false;
        while (this.canRead()) {
            this.skip();
            const c: string = this.peek();
            if (escaped) {
                if (c === QUOTE || c === ESCAPE) {
                    result += c;
                    escaped = false;
                } else {
                    return helper.fail(EXCEPTIONS.INVALID_ESCAPE.create(this.cursor - 1, // includes backslash
                        this.cursor + 1, c));
                }
            } else if (c === ESCAPE) {
                escaped = true;
            } else if (c === QUOTE) {
                return helper.succeed(result);
            } else {
                result += c;
            }
        }
        helper.addSuggestion(this.cursor, QUOTE); // Always cannot read at this point
        return helper.fail(EXCEPTIONS.EXPECTED_END_OF_QUOTE.create(start, this.string.length));
    }
    /**
     * Read a string from the string. If it surrounded by quotes, the quotes are ignored.
     * The cursor ends on the last character in the string.
     */
    public readString(): ReturnedInfo<string> {
        if (this.canRead() && this.peek() === QUOTE) {
            return this.readQuotedString();
        } else {
            const helper = new ReturnHelper();
            if (!this.canRead()) {
                helper.addSuggestions({ start: this.cursor, text: QUOTE });
            }
            return helper.succeed(this.readUnquotedString());
        }
    }

    /**
     * Expect a string from a selection
     */
    public readOption<T extends string>(options: T[], addError = true): ReturnedInfo<T, CE, string | false> {
        const start = this.cursor;
        const helper = new ReturnHelper();
        let quoted = false;
        if (this.peek() === QUOTE) {
            quoted = true;
        }
        const result = this.readString();
        if (!helper.merge(result, false)) {
            return helper.failWithData(false as any);
        }
        let valid: T | undefined;
        for (const option of options) {
            if (option === result.data) {
                valid = option;
            }
        }
        if (!this.canRead()) {
            helper.addSuggestions(...options.filter((v) => v.startsWith(result.data)).map<Suggestion>((v) => {
                return { start, text: quoted ? QUOTE + v + QUOTE : v };
            }));
        }
        if (valid) {
            return helper.succeed(valid);
        } else {
            if (addError) {
                helper.addErrors(EXCEPTIONS.EXPECTED_STRING_FROM.create(start, this.cursor,
                    JSON.stringify(options), result.data));
            }
            return helper.failWithData(result.data);
        }
    }
    /**
     * Read a boolean value from the string
     */
    public readBoolean(): ReturnedInfo<boolean> {
        const helper = new ReturnHelper();
        const start = this.cursor;
        const value = this.readOption<keyof typeof
            StringReader["bools"]>(typed_keys(StringReader.bools), false);
        if (!helper.merge(value)) {
            if (value.data !== false) {
                return helper.fail(EXCEPTIONS.INVALID_BOOL.create(start, this.cursor, value.data));
            } else {
                return helper.fail();
            }
        }
        return helper.succeed(StringReader.bools[value.data]);
    }

    /**
     * Require that a specific string follows
     * @param str The string which should come next
     */
    public expect(str: string): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (str.startsWith(this.getRemaining())) {
            helper.addSuggestions({ text: str, start: this.cursor });
        }
        const sub = this.string.substr(this.cursor, str.length);
        if (sub !== str) {
            return helper.fail(EXCEPTIONS.EXPECTED_SYMBOL.create(this.cursor,
                Math.min(this.string.length, this.cursor + str.length), sub, str));
        }
        this.cursor += str.length;
        return helper.succeed();
    }
    /**
     * Read the string until a certain regular expression matches the
     * character under the cursor.
     * @param exp The Regular expression to test against.
     */
    public readUntilRegexp(exp: RegExp) {
        return this.readWhileFunction((s) => !exp.test(s));
    }
    /**
     * Read the string while a certain regular expression matches the character under the cursor.
     * The cursor ends on the first character which doesn't match
     * @param exp The Regular Expression to test against
     */
    public readWhileRegexp(exp: RegExp): string {
        return this.readWhileFunction((s) => exp.test(s));
    }
    /**
     * Read while a certain function returns true on each consecutive character starting with the one under the cursor.
     * In most cases, it is better to use readWhileRegexp.
     * @param callback The function to use.
     */
    public readWhileFunction(callback: (char: string) => boolean): string {
        const begin = this.cursor;
        while (callback(this.peek())) {
            if (this.canRead()) {
                this.skip();
            } else {
                return this.string.substring(begin);
            }
        }
        return this.string.substring(begin, this.cursor);
    }
}
