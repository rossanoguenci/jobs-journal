/*
* todo: multilanguage support to be developed
*  missing provider
*
* */

import {en} from "./locales/en";

// All dictionaries grouped by locale
export const dictionaries = { en } as const;
type Dictionaries = typeof dictionaries;
export type Locale = keyof Dictionaries; // "en" | "ro" | ...


// Model the nested translation structure
type TranslationNode = string | { [key: string]: TranslationNode };

// Helper to traverse a dictionary safely by dot-path
function lookup(dict: TranslationNode, path: string): string | undefined {
    const keys = path.split(".");
    let node: TranslationNode | undefined = dict;
    for (const key of keys) {
        if (typeof node === "string") return undefined; // cannot go deeper into a leaf
        node = (node as Record<string, TranslationNode>)[key];
        if (node === undefined) return undefined;
    }
    return typeof node === "string" ? node : undefined;
}


// Switchable, fallback-aware translator
export function t(
    path: string,
    options?: { locale?: Locale; fallbacks?: Locale[]; defaultText?: string }
): string {
    const locale = options?.locale ?? currentLocale;
    const chain: Locale[] = [locale, ...(options?.fallbacks ?? defaultFallbacks)];

    for (const loc of chain) {
        const dict = dictionaries[loc] as unknown as TranslationNode;
        const found = lookup(dict, path);
        if (found !== undefined) return found;
    }

    // Last resort: show defaultText if provided, otherwise the key path itself
    return options?.defaultText ?? path;
}

// Current locale storage (module-level or managed via React context below)
let currentLocale: Locale = "en";
export function setLocale(locale: Locale) {
    currentLocale = locale;
}
export function getLocale(): Locale {
    return currentLocale;
}

// Global fallback chain (e.g., prefer specific + fallback to English)
const defaultFallbacks: Locale[] = ["en"]; // can be [] if you don’t want fallback