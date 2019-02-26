// Create global variables

// tslint:disable-next-line:no-namespace
declare namespace NodeJS {
    interface Global {
        mcLangLog: typeof mcLangLog;
        mcLangSettings: typeof mcLangSettings;
    }
}
/**
 * The settings which this server has been run with.
 */
declare const mcLangSettings: McFunctionSettings;

interface McFunctionSettings extends LocalMcFunctionSettings {
    /**
     * Settings related to the collection of data.
     */
    data: {
        /**
         * Global Scoped Setting
         *
         * __Advanced Users Only__
         *
         * The path to a custom (server) jar to attempt to extract data from.
         *
         * This is recommended for when working with mods,
         * or past Minecraft versions (AFTER 1.13 Snapshot 18w01a) only.
         *
         * Note that not all mod parsers will be always supported, and features may change between snapshots.
         */
        customJar: string;
        /**
         * Global Scoped Setting
         *
         * Whether to enable the automatic Data Collection downloading.
         *
         * This does not affect the customJar setting.
         *
         * Enabled by default, but the collector is disabled.
         */
        download: boolean;
        /**
         * Global Scoped Setting
         *
         * Whether the Data Collection is enabled.
         *
         * This DOES affect the customJar setting.
         *
         * Disabled by default.
         */
        enabled: boolean;
        /**
         * Global Scoped Setting
         *
         * __Advanced Users Only__
         *
         * An optional custom path to the java executable (`java`/`java.exe`).
         *
         * Should be left blank to use the default `java` in PATH.
         */
        javaPath: string; // Should be fine if points to javaw, stout is unused insofar.
        /**
         * Whether or not to use snapshot versions when collecting data.
         */
        snapshots: boolean;
    };
    /**
     * Custom parsers to be used.
     * Note that external users of the server should not support this setting
     */
    parsers?: {
        [name: string]: import("./types").Parser;
    };
    /**
     * Settings related to information tracking
     */
    trace: {
        /**
         * Whether or not to show output from internal logging messages.
         */
        internalLogging: boolean;
    };
    /**
     * Settings related to translating the server errors.
     */
    translation: {
        /**
         * The code for the language to be used.
         */
        lang: string;
    };
}

interface LocalMcFunctionSettings {
    packhandling: {
        /**
         * Error when there is an invalid extension
         */
        errorExtensions: boolean;
        /**
         * Additional extensions which are allowed
         */
        permittedExtensions: string[];
    };
}

/**
 * Log a message to the console.
 *
 * This message will always be available
 * to the user in the language server output.
 */
declare const mcLangLog: McLogger & InternalLog;
interface McLogger {
    /**
     * Log to the console a message useful for debugging.
     *
     * This is disabled or enabled
     * based on the "mcfunction.trace.internalLogging" setting
     */
    internal(message: string): void;
}
/**
 * An internal logging type to allow proper typing information to be used for mcLangLog.
 */
type InternalLog = (message: string) => void;

interface Dictionary<T> {
    [key: string]: T;
}
