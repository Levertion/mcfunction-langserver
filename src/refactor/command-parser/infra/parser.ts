import { typed_keys } from "../../../misc-functions/third_party/typed-keys";
import { LineRange } from "../types";

import { ErrorID, registerError } from "./errors";
import { ParseResults, Suggestion } from "./parse-results";
import { Err, isErr, Ok, Result } from "./result";

/**
 * String reader exceptions.
 * Codes 1000-1100
 */
const EXCEPTIONS = {
    EXPECTED_BOOL: registerError(1000, "Expected bool"),
    EXPECTED_END_OF_QUOTE: registerError(1031, "Unclosed quoted string"),
    EXPECTED_FLOAT: registerError(1020, "Expected float"),
    EXPECTED_INT: registerError(1010, "Expected integer"),
    EXPECTED_START_OF_QUOTE: registerError(
        1030,
        "Expected quote to start a string"
    ),
    EXPECTED_STRING_FROM: registerError(
        1041,
        "Expected string from [%s], got '%s'"
    ),
    EXPECTED_SYMBOL: registerError(1040, "Expected '%s'"),
    INVALID_BOOL: registerError(
        1001,
        "Invalid bool, expected true or false but found '%s'"
    ),
    INVALID_ESCAPE: registerError(
        1032,
        "Invalid escape sequence '\\%s' in quoted string)"
    ),
    INVALID_FLOAT: registerError(1021, "Invalid float '%s'"),
    INVALID_INT: registerError(1011, "Invalid integer '%s'")
};

const ESCAPE = "\\";

export interface QuotingInfo {
    /**
     * True if quoting is allowed
     */
    quote: boolean;
    /**
     * Defined if not quoting is allowed
     */
    unquoted?: RegExp;
}

const QUOTES = ['"', "'"];

/**
 * A parser type, which is analogous to the StringReader type from Mojang's Brigadier,
 * but also supports inline storage of errors and suggestions.
 */
export class Parser extends ParseResults {
    public static charAllowedInUnquotedString = /^[0-9A-Za-z_\-\.+]$/;
    public static charAllowedNumber = /^[0-9\-\.]$/;
    public static defaultQuotingInfo: QuotingInfo = {
        quote: true,
        unquoted: Parser.charAllowedInUnquotedString
    };
    public static noQuoteInfo: QuotingInfo = {
        quote: false,
        unquoted: Parser.charAllowedInUnquotedString
    };
    public static quotesOnly: QuotingInfo = { quote: true };

    public static isQuotedStringStart(char: string): boolean {
        return QUOTES.includes(char);
    }

    private static readonly bools = { true: true, false: false };
    public cursor = 0;
    public readonly string: string;

    public constructor(
        stringToRead: string,
        ...superParameters: ConstructorParameters<typeof ParseResults>
    ) {
        super(...superParameters);
        this.string = stringToRead;
    }

    public addError(
        id: ErrorID,
        range: LineRange | number,
        ...substitutions: string[]
    ): void {
        super.addError(
            id,
            typeof range === "number"
                ? { start: range, end: this.cursor }
                : range,
            ...substitutions
        );
    }

    public canRead(length: number = 1): boolean {
        return this.cursor + length <= this.string.length;
    }
    /**
     * Require that a specific string follows
     * @param str The string which should come next
     */
    public expect(str: string): boolean {
        if (this.getRemainingLength() <= str.length) {
            this.addSuggestion(this.cursor, str);
        }
        const sub = this.string.substr(this.cursor, str.length);
        if (sub !== str) {
            this.addError(
                EXCEPTIONS.EXPECTED_SYMBOL,
                Math.min(this.string.length, this.cursor + str.length),
                str
            );
            return false;
        }
        this.cursor += str.length;
        return true;
    }

    public expectOption<T extends string>(...options: T[]): T | undefined {
        const start = this.cursor;
        let out: string | undefined;
        for (const s of options) {
            if (
                this.callMethod(
                    this.expect.bind(this),
                    {
                        errors: false
                    },
                    s
                )
            ) {
                if (!out || s.length > out.length) {
                    out = s;
                }
                this.cursor = start;
            }
        }
        if (!out) {
            const end = Math.min(
                this.getTotalLength(),
                start + Math.max(...options.map(v => v.length))
            );
            this.addError(
                EXCEPTIONS.EXPECTED_STRING_FROM,
                { start, end },
                options.join(),
                this.getRemaining()
            );
            return undefined;
        }
        this.cursor += out.length;
        return out as T;
    }

    public getRead(): string {
        return this.string.substring(0, this.cursor);
    }
    public getRemaining(): string {
        return this.string.substring(this.cursor);
    }
    public getRemainingLength(): number {
        return this.string.length - this.cursor;
    }
    public getTotalLength(): number {
        return this.string.length;
    }
    public peek(offset: number = 0): string {
        return this.string.charAt(this.cursor + offset);
    }
    public read(): string {
        return this.string.charAt(this.cursor++);
    }
    /**
     * Read a boolean value from the string
     */
    public readBoolean(quoting?: QuotingInfo): boolean | undefined {
        const start = this.cursor;
        const value = this.readOption<keyof typeof Parser["bools"]>(
            typed_keys(Parser.bools),
            quoting
        );
        if (isErr(value)) {
            if (value.err) {
                this.addError(EXCEPTIONS.INVALID_BOOL, start, value.err);
            }
            // Invalid quoted string otherwise, so no new error.
            return undefined;
        }
        return Parser.bools[value.ok];
    }
    /**
     * Read a float from the string
     */
    public readFloat(): number | undefined {
        const start = this.cursor;
        const readToTest: string = this.readWhileRegexp(
            Parser.charAllowedNumber
        );
        if (readToTest.length === 0) {
            this.addError(EXCEPTIONS.EXPECTED_FLOAT, {
                end: this.string.length,
                start
            });
            return undefined;
        }

        // The Java readInt throws upon multiple `.`s, but Javascript's doesn't
        if ((readToTest.match(/\./g) || []).length > 1) {
            this.addError(
                EXCEPTIONS.INVALID_FLOAT,
                start,
                this.string.substring(start, this.cursor)
            );
            return undefined;
        }
        try {
            return parseFloat(readToTest);
        } catch (error) {
            this.addError(EXCEPTIONS.INVALID_FLOAT, start, readToTest);
            return undefined;
        }
    }
    /**
     * Read an integer from the string
     */
    public readInt(): number | undefined {
        const start = this.cursor;
        const readToTest: string = this.readWhileRegexp(
            Parser.charAllowedNumber
        );
        if (readToTest.length === 0) {
            this.addError(EXCEPTIONS.EXPECTED_INT, {
                end: this.string.length,
                start
            });
            return undefined;
        }
        // The Java readInt throws upon a `.`, but the regex includes one in brigadier
        // This handles this case
        if (readToTest.indexOf(".") !== -1) {
            this.addError(
                EXCEPTIONS.INVALID_INT,
                start,
                this.string.substring(start, this.cursor)
            );
            return undefined;
        }
        try {
            return Number.parseInt(readToTest, 10);
        } catch (error) {
            this.addError(EXCEPTIONS.INVALID_INT, start, readToTest);
            return undefined;
        }
    }
    /**
     * Expect a string from a selection
     */
    public readOption<T extends string>(
        options: T[],
        quoting: QuotingInfo = Parser.defaultQuotingInfo,
        suggestion?: Suggestion
    ): Result<T, string | undefined> {
        const start = this.cursor;
        const result = this.callMethod(
            this.readOptionInner.bind(this),
            { suggestions: false },
            quoting
        );
        if (this.shouldSugggest()) {
            for (const option of options) {
                this.addSuggestion(
                    start,
                    quoteIfNeeded(option, quoting),
                    suggestion
                );
            }
        }
        if (isErr(result)) {
            return result;
        }
        const { ok } = result;
        const valid = options.some(opt => opt === ok);
        if (valid) {
            return Ok(ok as T);
        }
        return Err(ok);
    }
    /**
     * Read from the string, returning a string, which, in the original had been surrounded by quotes
     */
    public readQuotedString(): Result<string, string | undefined> {
        const start = this.cursor;
        if (!this.canRead()) {
            // Following the behaviour of Brigadier:
            // - https://github.com/Mojang/brigadier/blob/master/src/main/java/com/mojang/brigadier/StringReader.java#L185
            return Ok("");
        }
        const terminator = this.peek();
        if (!Parser.isQuotedStringStart(terminator)) {
            this.addError(EXCEPTIONS.EXPECTED_START_OF_QUOTE, {
                end: this.string.length,
                start: this.cursor
            });
            return Err(undefined);
        }
        let result = "";
        let escaped = false;
        while (this.canRead()) {
            this.skip();
            const char: string = this.peek();
            if (escaped) {
                if (char === terminator || char === ESCAPE) {
                    result += char;
                    escaped = false;
                } else {
                    this.skip();
                    this.addError(
                        EXCEPTIONS.INVALID_ESCAPE,
                        // Includes backslash
                        this.cursor - 2,
                        char
                    );
                }
            } else if (char === ESCAPE) {
                escaped = true;
            } else if (char === terminator) {
                this.skip();
                return Ok(result);
                // This is https://github.com/palantir/tslint/issues/4600. (Fixed in next version)
                // tslint:disable-next-line: unnecessary-else
            } else {
                result += char;
            }
        }
        this.addSuggestion(this.cursor, terminator);
        this.addError(EXCEPTIONS.EXPECTED_END_OF_QUOTE, start);
        return Err(result);
    }
    /**
     * Read a (quoted or unquoted) string literal from the string
     */
    public readString(
        unquotedRegex: RegExp = Parser.charAllowedInUnquotedString
    ): Result<string, string | undefined> {
        if (this.canRead() && Parser.isQuotedStringStart(this.peek())) {
            return this.readQuotedString();
        }
        if (this.shouldSugggest()) {
            this.addSuggestion(this.cursor, QUOTES[0]);
        }
        return Ok(this.readWhileRegexp(unquotedRegex));
    }

    /**
     * Read a string which is not surrounded by quotes.
     * Can only contain alphanumerical characters, _,+,. and -
     */
    public readUnquotedString(): string {
        return this.readWhileRegexp(Parser.charAllowedInUnquotedString);
    }

    /**
     * Read the string until a certain regular expression matches the
     * character under the cursor.
     * @param exp The Regular expression to test against.
     */
    public readUntilRegexp(exp: RegExp): string {
        return this.readWhileFunction(s => !exp.test(s));
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
    /**
     * Read the string while a certain regular expression matches the character under the cursor.
     * The cursor ends on the first character which doesn't match
     * @param exp The Regular Expression to test against
     */
    public readWhileRegexp(exp: RegExp): string {
        return this.readWhileFunction(s => exp.test(s));
    }

    /**
     * The most common check is !this.canRead() to block suggestions
     */
    public shouldSugggest(): boolean {
        return this.suggesting && !this.canRead();
    }

    public skip(): void {
        this.cursor++;
    }
    public skipWhitespace(): void {
        this.readWhileRegexp(/\s/); // Whitespace
    }
    private readOptionInner(
        info: QuotingInfo
    ): Result<string, string | undefined> {
        if (info.quote) {
            return this.readString(info.unquoted);
        }
        if (info.unquoted) {
            return Ok(this.readWhileRegexp(info.unquoted));
        }
        throw new Error(
            "Quoting kind which doesn't support quoting or any characters"
        );
    }
}

export function quoteIfNeeded(
    value: string,
    quoting: QuotingInfo = Parser.defaultQuotingInfo
): string {
    if (!quoting.quote) {
        return value;
    }
    let needsQuotes = false;
    const quoteCounts: Record<string, number> = { '"': 0, "'": 0 };
    if (quoting.unquoted) {
        for (const char of value) {
            if (!char.match(quoting.unquoted)) {
                needsQuotes = true;
            }
            if (quoteCounts.hasOwnProperty(char)) {
                quoteCounts[char]++;
            }
        }
        return value;
    }
    if (needsQuotes) {
        const [[quote]] = Object.entries(quoteCounts).sort(
            (prev, next) => prev[1] - next[1]
        );
        return quote + escapeQuotes(value, quote) + quote;
    }
    return value;
}

function escapeQuotes(value: string, quote: string = '"'): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(new RegExp(quote, "g"), `\\${quote}`);
}

export const READER_EXCEPTIONS = EXCEPTIONS;
