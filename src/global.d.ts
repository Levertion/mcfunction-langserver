
/*=====================================
        Global Variable Setup
=====================================*/

// Global Declarations

declare namespace NodeJS {
    interface Global {
        mcLangLog: typeof mcLangLog;
        mcLangSettings: typeof mcLangSettings;
    }
}
/**
 * The settings which this server has been run with.
 */
declare const mcLangSettings: DeepReadonly<McFunctionSettings>; // Notice that these settings are only readonly at compile time.
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
interface McFunctionSettings {
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
         * Whether or not the translations are enabled.
         * If the lang setting is en-us, then this is assummed to be 
        */
        enabled: boolean;
        /**
         * The code for the language to be used.
         * This will be used as the filename from the Minecraft root assets folder
         * (with `.json` added to the end)
         */
        lang: string;
    }
    /**
     * Settings related to the collection of data.
     */
    data: {
        /**
         * Whether to enable the automatic Data Collection downloading.
         * 
         * This does not affect the customJar setting.
         * 
         * Enabled by default, but the collector is disabled.
         */
        download: boolean;
        /**
         * Whether the Data Collection is enabled.
         * 
         * This DOES affect the customJar setting.
         * 
         * Disabled by default.
         */
        enabled: boolean;
        /**
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
    }
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
    internal: (message: string) => void;
}
/**
 * An internal logging type to allow proper typing information to be used for mcLangLog.
 */
type InternalLog = (message: string) => void
