import { vsprintf } from "sprintf-js";

export function shouldTranslate(): boolean {
    return mcLangSettings.translation.lang.toLowerCase() !== "en-us";
}

export function MCFormat(base: string, ...substitutions: string[]): string {
    return vsprintf(base, substitutions);
}
