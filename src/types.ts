import { CommandError } from "./brigadier_components/errors";

/**
 * A deeply readonly version of the given type.
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

/**
 * A Single Line in a Document.
 */
export interface CommandLine {
    /**
     * The error of this line.
     *
     * TODO, look into multiple errors per line.
     */
    error?: CommandError;
    /**
     * The text of this line.
     */
    text: string;
    /**
     * TODO - look into most efficient way of implementing this.
     */
    // sections?
}

export interface FunctionData {
    /**
     * Needs to become a packs data object.
     *
     * This will be a reference to the pack data in the global data manager.
     */
    local_pack_data: {};
}

export interface FunctionInfo {
    /**
     * The lines of this Function.
     */
    lines: CommandLine[];
    /**
     * The filesystem path to the `datapacks` folder this is part of.
     *
     * This is NOT the folder of the datapack
     */
    datapack_root: string;
    /**
     * This is data which should be available to the parsers.
     */
    data: FunctionData;
}
