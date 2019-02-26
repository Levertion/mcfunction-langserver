import { CompletionItemKind } from "vscode-languageserver/lib/main";

import { getReturned, ReturnHelper } from "../misc-functions";
import { typed_keys } from "../misc-functions/third_party/typed-keys";
import { CE, ReturnedInfo, Suggestion } from "../types";

import { CommandErrorBuilder } from "./errors";

const EXCEPTIONS = {
    EXPECTED_BOOL: new CommandErrorBuilder(
        "parsing.bool.expected",
        "Expected bool"
    ),
    EXPECTED_END_OF_QUOTE: new CommandErrorBuilder(
        "parsing.quote.expected.end",
        "Unclosed quoted string"
    ),
    EXPECTED_FLOAT: new CommandErrorBuilder(
        "parsing.float.expected",
        "Expected float"
    ),
    EXPECTED_INT: new CommandErrorBuilder(
        "parsing.int.expected",
        "Expected integer"
    ),
    EXPECTED_START_OF_QUOTE: new CommandErrorBuilder(
        "parsing.quote.expected.start",
        "Expected quote to start a string"
    ),
    EXPECTED_STRING_FROM: new CommandErrorBuilder(
        "parsing.expected.option",
        "Expected string from [%s], got '%s'"
    ),
    EXPECTED_SYMBOL: new CommandErrorBuilder(
        "parsing.expected",
        "Expected '%s'"
    ),
    INVALID_BOOL: new CommandErrorBuilder(
        "parsing.bool.invalid",
        "Invalid bool, expected true or false but found '%s'"
    ),
    INVALID_ESCAPE: new CommandErrorBuilder(
        "parsing.quote.escape",
        "Invalid escape sequence '\\%s' in quoted string)"
    ),
    INVALID_FLOAT: new CommandErrorBuilder(
        "parsing.float.invalid",
        "Invalid float '%s'"
    ),
    INVALID_INT: new CommandErrorBuilder(
        "parsing.int.invalid",
        "Invalid integer '%s'"
    )
};

const QUOTE = '"';
const SINGLE_QUOTE = "'";
const ESCAPE = "\\";
export type QuotingKind = "both" | "yes" | RegExp;

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
export class StringReader {
    public static charAllowedInUnquotedString = /^[0-9A-Za-z_\-\.+]$/;
    public static charAllowedNumber = /^[0-9\-\.]$/;
    public static defaultQuotingInfo: QuotingInfo = {
        quote: true,
        unquoted: StringReader.charAllowedInUnquotedString
    };
    public static isQuotedStringStart(char: string): boolean {
        return char === QUOTE || char === SINGLE_QUOTE;
    }

    private static readonly bools = { true: true, false: false };

    public cursor = 0;
    public readonly string: string;

    public constructor(stringToRead: string) {
        this.string = stringToRead;
    }
    public canRead(length: number = 1): boolean {
        return this.cursor + length <= this.string.length;
    }
    /**
     * Require that a specific string follows
     * @param str The string which should come next
     */
    public expect(str: string): ReturnedInfo<undefined> {
        const helper = new ReturnHelper();
        if (str.startsWith(this.getRemaining())) {
            helper.addSuggestions({
                start: this.cursor,
                text: str
            });
        }
        const sub = this.string.substr(this.cursor, str.length);
        if (sub !== str) {
            return helper.fail(
                EXCEPTIONS.EXPECTED_SYMBOL.create(
                    this.cursor,
                    Math.min(this.string.length, this.cursor + str.length),
                    str
                )
            );
        }
        this.cursor += str.length;
        return helper.succeed();
    }

    public expectOption<T extends string>(...options: T[]): ReturnedInfo<T> {
        const helper = new ReturnHelper();
        const start = this.cursor;
        let out: string | undefined;
        for (const s of options) {
            if (
                helper.merge(this.expect(s), {
                    errors: false
                })
            ) {
                if (!out || s.length > out.length) {
                    out = s;
                }
                this.cursor = start;
            }
        }
        if (!out) {
            return helper.fail(
                EXCEPTIONS.EXPECTED_STRING_FROM.create(
                    start,
                    Math.min(
                        this.getTotalLength(),
                        start + Math.max(...options.map(v => v.length))
                    ),
                    options.join(),
                    this.getRemaining()
                )
            );
        }
        this.cursor += out.length;
        return helper.succeed(out as T);
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
    public readBoolean(quoting?: QuotingInfo): ReturnedInfo<boolean> {
        const helper = new ReturnHelper();
        const start = this.cursor;
        const value = this.readOption<keyof typeof StringReader["bools"]>(
            typed_keys(StringReader.bools),
            quoting
        );
        if (!helper.merge(value)) {
            if (value.data !== undefined) {
                return helper.fail(
                    EXCEPTIONS.INVALID_BOOL.create(
                        start,
                        this.cursor,
                        value.data
                    )
                );
            } else {
                return helper.fail();
            }
        }
        return helper.succeed(StringReader.bools[value.data]);
    }
    /**
     * Read a float from the string
     */
    public readFloat(): ReturnedInfo<number> {
        const helper = new ReturnHelper();
        const start: number = this.cursor;
        const readToTest: string = this.readWhileRegexp(
            StringReader.charAllowedNumber
        );
        if (readToTest.length === 0) {
            return helper.fail(
                EXCEPTIONS.EXPECTED_FLOAT.create(start, this.string.length)
            );
        }

        // The Java readInt throws upon multiple `.`s, but Javascript's doesn't
        if ((readToTest.match(/\./g) || []).length > 1) {
            return helper.fail(
                EXCEPTIONS.INVALID_FLOAT.create(
                    start,
                    this.cursor,
                    this.string.substring(start, this.cursor)
                )
            );
        }
        try {
            return helper.succeed(parseFloat(readToTest));
        } catch (error) {
            return helper.fail(
                EXCEPTIONS.INVALID_FLOAT.create(start, this.cursor, readToTest)
            );
        }
    }
    /**
     * Read an integer from the string
     */
    public readInt(): ReturnedInfo<number> {
        const helper = new ReturnHelper();
        const start: number = this.cursor;
        const readToTest: string = this.readWhileRegexp(
            StringReader.charAllowedNumber
        );
        if (readToTest.length === 0) {
            return helper.fail(
                EXCEPTIONS.EXPECTED_INT.create(start, this.string.length)
            );
        }
        // The Java readInt throws upon a `.`, but the regex includes one in brigadier
        // This handles this case
        if (readToTest.indexOf(".") !== -1) {
            return helper.fail(
                EXCEPTIONS.INVALID_INT.create(
                    start,
                    this.cursor,
                    this.string.substring(start, this.cursor)
                )
            );
        }
        try {
            return helper.succeed(Number.parseInt(readToTest, 10));
        } catch (error) {
            return helper.fail(
                EXCEPTIONS.INVALID_INT.create(start, this.cursor, readToTest)
            );
        }
    }
    /**
     * Expect a string from a selection
     * @param quoteKind how should the string be handled.
     * - `both`: StringReader::readString()
     * - `yes`: StringReader::readQuotedString()
     * - `no`: StringReader::readUnquotedString()
     */
    public readOption<T extends string>(
        options: T[],
        quoteKind: QuotingInfo = StringReader.defaultQuotingInfo,
        completion?: CompletionItemKind
    ): ReturnedInfo<T, CE, string | undefined> {
        const start = this.cursor;
        const helper = new ReturnHelper();
        const result = this.readOptionInner(quoteKind);
        // Reading failed, which must be due to an invalid quoted string
        if (!helper.merge(result, { suggestions: false })) {
            if (result.data && !this.canRead()) {
                const bestEffort = result.data;
                helper.addSuggestions(
                    ...options
                        .filter(option => option.startsWith(bestEffort))
                        .map<Suggestion>(v =>
                            completionForString(v, start, quoteKind, completion)
                        )
                );
            }
            return helper.fail();
        }
        const valid = options.some(opt => opt === result.data);
        if (!this.canRead()) {
            helper.addSuggestions(
                ...options
                    .filter(opt => opt.startsWith(result.data))
                    .map<Suggestion>(v =>
                        completionForString(v, start, quoteKind, completion)
                    )
            );
        }
        if (valid) {
            return helper.succeed(result.data as T);
        } else {
            /* if (addError) {
                helper.addErrors(
                    EXCEPTIONS.EXPECTED_STRING_FROM.create(
                        start,
                        this.cursor,
                        JSON.stringify(options),
                        result.data
                    )
                );
            } */
            return helper.failWithData(result.data);
        }
    }
    /**
     * Read from the string, returning a string, which, in the original had been surrounded by quotes
     */
    public readQuotedString(): ReturnedInfo<string, CE, string | undefined> {
        const helper = new ReturnHelper();
        const start = this.cursor;
        if (!this.canRead()) {
            return helper.succeed("");
        }
        const terminator = this.peek();
        if (!StringReader.isQuotedStringStart(terminator)) {
            return helper.fail(
                EXCEPTIONS.EXPECTED_START_OF_QUOTE.create(
                    this.cursor,
                    this.string.length
                )
            );
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
                    return helper.fail(
                        EXCEPTIONS.INVALID_ESCAPE.create(
                            this.cursor - 2,
                            this.cursor,
                            char
                        )
                    ); // Includes backslash
                }
            } else if (char === ESCAPE) {
                escaped = true;
            } else if (char === terminator) {
                this.skip();
                return helper.succeed(result);
            } else {
                result += char;
            }
        }
        return helper
            .addSuggestion(this.cursor, terminator) // Always cannot read at this point
            .addErrors(
                EXCEPTIONS.EXPECTED_END_OF_QUOTE.create(
                    start,
                    this.string.length
                )
            )
            .failWithData(result);
    }
    /**
     * Read a string from the string. If it surrounded by quotes, the quotes are ignored.
     * The cursor ends on the last character in the string.
     */
    public readString(
        unquotedRegex: RegExp = StringReader.charAllowedInUnquotedString
    ): ReturnedInfo<string, CE, string | undefined> {
        const helper = new ReturnHelper();
        if (this.canRead() && StringReader.isQuotedStringStart(this.peek())) {
            return helper.return(this.readQuotedString());
        } else {
            if (!this.canRead()) {
                helper.addSuggestions({
                    start: this.cursor,
                    text: QUOTE
                });
            }
            return helper.succeed(this.readWhileRegexp(unquotedRegex));
        }
    }

    /**
     * Read a string which is not surrounded by quotes.
     * Can only contain alphanumerical characters, _,+,. and -
     */
    public readUnquotedString(): string {
        return this.readWhileRegexp(StringReader.charAllowedInUnquotedString);
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

    public skip(): void {
        this.cursor++;
    }
    public skipWhitespace(): void {
        this.readWhileRegexp(/\s/); // Whitespace
    }
    private readOptionInner(
        info: QuotingInfo
    ): ReturnedInfo<string, CE, string | undefined> {
        // tslint:disable:helper-return
        if (info.quote) {
            return this.readString(info.unquoted);
        } else {
            if (info.unquoted) {
                return getReturned(this.readWhileRegexp(info.unquoted));
            } else {
                throw new Error(
                    "Quoting kind which doesn't support quoting or any characters"
                );
            }
        }
        // tslint:enable:helper-return
    }
}

export function completionForString(
    value: string,
    start: number,
    quoting: QuotingInfo,
    kind?: CompletionItemKind
): Suggestion {
    return { kind, start, text: quoteIfNeeded(value, quoting) };
}

export function quoteIfNeeded(
    value: string,
    quoting: QuotingInfo = StringReader.defaultQuotingInfo
): string {
    if (!quoting.quote) {
        return value;
    } else {
        if (quoting.unquoted) {
            for (const char of value) {
                if (!char.match(quoting.unquoted)) {
                    return QUOTE + escapeQuotes(value) + QUOTE;
                }
            }
            return value;
        }
        return QUOTE + escapeQuotes(value) + QUOTE;
    }
}

function escapeQuotes(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export const READER_EXCEPTIONS = EXCEPTIONS;
