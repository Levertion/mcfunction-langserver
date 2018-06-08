import { format } from "util";

export function shouldTranslate(): boolean {
    return mcLangSettings.translation.lang.toLowerCase() !== "en-us";
}

export function MCFormat(base: string, ...substitutions: string[]): string {
    return format(base, ...substitutions);
    // TODO, make more like Minecraft's substitutions.
    // Either to implement in-house or using package such as
    // See https://www.npmjs.com/package/printf
}
