import { CommandErrorBuilder } from "./errors";

const EXCEPTIONS = {
    EXPECTED_BOOL: new CommandErrorBuilder("parsing.bool.expected", "Expected bool"),
    EXPECTED_END_OF_QUOTE: new CommandErrorBuilder("parsing.quote.expected.end",
        "Unclosed quoted string"),
    EXPECTED_FLOAT: new CommandErrorBuilder("parsing.float.expected", "Expected float"),
    EXPECTED_INT: new CommandErrorBuilder("parsing.int.expected", "Expected integer"),
    EXPECTED_START_OF_QUOTE: new CommandErrorBuilder("parsing.quote.expected.start",
        "Expected quote to start a string"),
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

export class StringReader implements ImmutableStringReader {
    public static charAllowedNumber = /^[0-9\-\.]$/;
    public static charAllowedInUnquotedString = /^[0-9A-Za-z_\-\.+]$/;
    public static isWhiteSpace(char: string) {
        return char === "\n" || char === "\t";
    }
    public cursor: number = 0;
    public readonly string: string;

    constructor(stringToRead: string) {
        this.string = stringToRead;
    }

    public getRemainingLength(): number {
        return this.string.length - this.cursor;
    }

    public getTotalLength(): number {
        return this.string.length;
    }
    public getRead() {
        return this.string.substring(0, this.cursor);
    }
    public getRemaining() {
        return this.string.substring(this.cursor);
    }
    public canRead(length = 1) {
        return this.cursor + length <= this.string.length;
    }
    public peek(offset = 0) {
        return this.string.charAt(this.cursor + offset);
    }
    public read(): string {
        return this.string.charAt(this.cursor++);
    }
    public skip() {
        this.cursor++;
    }
    public skipWhitespace() {
        this.readWhileRegexp(/\s/); // Whitespace
    }
    /**
     * Read an integer from the string
     */
    public readInt(): number {
        const start: number = this.cursor;
        const readToTest: string = this.readWhileRegexp(StringReader.charAllowedNumber);
        if (readToTest.length === 0) {
            throw EXCEPTIONS.EXPECTED_INT.create(start, this.string.length);
        }
        // The Java readInt crashes upon a `.`, but the regex includes one in brigadier
        if (readToTest.indexOf(".") !== -1) {
            throw EXCEPTIONS.INVALID_INT.create(start, this.cursor, this.string.substring(start, this.cursor));
        }
        try {
            return Number.parseInt(readToTest, 10);
        } catch (error) {
            throw EXCEPTIONS.INVALID_INT.create(start, this.cursor, readToTest);
        }
    }
    /**
     * Read a from the string
     */
    public readFloat(): number {
        const start: number = this.cursor;
        const readToTest: string = this.readWhileRegexp(StringReader.charAllowedNumber);
        if (readToTest.length === 0) {
            throw EXCEPTIONS.EXPECTED_FLOAT.create(start, this.string.length);
        }
        try {
            return parseFloat(readToTest);
        } catch (error) {
            throw EXCEPTIONS.EXPECTED_INT.create(start, this.cursor, readToTest);
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
    public readQuotedString(): string {
        const start = this.cursor;
        if (!this.canRead()) {
            return "";
        }
        if (this.peek() !== QUOTE) {
            throw EXCEPTIONS.EXPECTED_START_OF_QUOTE.create(this.cursor, this.string.length);
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
                    this.cursor = this.cursor - 1;
                    throw EXCEPTIONS.EXPECTED_END_OF_QUOTE.create(this.cursor, this.string.length, c);
                }
            } else if (c === ESCAPE) {
                escaped = true;
            } else if (c === QUOTE) {
                return result;
            } else {
                result += c;
            }
        }
        throw EXCEPTIONS.EXPECTED_END_OF_QUOTE.create(start, this.string.length);
    }
    /**
     * Read a string from the string. If it surrounded by quotes, the quotes are ignored.
     * The cursor ends on the last character in the string.
     */
    public readString(): string {
        if (this.canRead() && this.peek() === QUOTE) {
            return this.readQuotedString();
        } else {
            return this.readUnquotedString();
        }
    }
    /**
     * Read a boolean value from the string
     */
    public readBoolean(): boolean {
        const start: number = this.cursor;
        const value: string = this.readString();
        if (value.length === 0) {
            throw EXCEPTIONS.EXPECTED_BOOL.create(this.cursor, this.string.length);
        }
        switch (value) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                throw EXCEPTIONS.INVALID_BOOL.create(start, this.cursor, value);
        }
    }
    /**
     * Require that a specific character follows
     * @param c The character which should come next
     */
    public expect(c: string) {
        if (this.peek() !== c) {
            throw EXCEPTIONS.EXPECTED_SYMBOL.create(this.cursor, this.cursor, this.peek(), c);
        }
        if (this.canRead()) {
            this.skip();
        }
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

export interface ImmutableStringReader {
    readonly string: string;
    readonly cursor: number;
    /**
     * The number of remaining characters until the end of the string.
     * This is under the assumption that the character under the cursor has not been read.
     */
    getRemainingLength: () => number;
    /**
     * Get the total length of this string.
     */
    getTotalLength: () => number;
    /**
     * Get the text in the string which has been already read
     */
    getRead: () => string;
    /**
     * Get the text from the reader which hasn't been read yet.
     */
    getRemaining: () => string;
    /**
     * Is it safe to read?
     * @param length The number of characters. Can be omitted
     */
    canRead: (length?: number) => boolean;
    /**
     * Look at a character without moving the cursor.
     * @param offset Where to look relative to the cursor. Can be omitted
     */
    peek: (offset?: number) => string;
}
