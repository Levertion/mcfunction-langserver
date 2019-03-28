import { vsprintf } from "sprintf-js";

export function shouldTranslate(): boolean {
    return mcLangSettings.translation.lang.toLowerCase() !== "en-us";
}

/**
 * @todo - make this work with translations
 * We need to handle translating both the vanilla translations and the errors
 * not supported in vanilla.
 */
export function MCFormat(base: string, ...substitutions: string[]): string {
    return vsprintf(base, substitutions);
}
