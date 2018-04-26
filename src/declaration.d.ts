// Create global variables

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
         * The code for the language to be used.
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
    /**
     * Custom parsers to be used
     */
    parsers: {
        [name: string]: string;
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

// Type definitions for util.promisify 1.0
// Project: https://github.com/ljharb/util.promisify#readme
// Definitions by: Adam Voss <https://github.com/adamvoss>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// Modified to exclude the redeclaration of util.promisify for this project
declare module "util.promisify" {
    export = promisify;

    function promisify(f: (...args: any[]) => void): (...args: any[]) => Promise<any>;

    namespace promisify {
        interface implementation {
            (fn: (...args: any[]) => void): (...args: any[]) => Promise<any>;
            custom: symbol;
            customPromisifyArgs: symbol | undefined;
        }

        const custom: symbol;
        const customPromisifyArgs: symbol;
        function getPolyfill(): implementation;
        const implementation: implementation;
        function shim(): implementation;
    }
}
