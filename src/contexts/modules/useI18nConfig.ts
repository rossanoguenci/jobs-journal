import { useCallback, useMemo, useState } from "react";
import { t as baseT, setLocale as setGlobalLocale, getLocale, type Locale } from "@/i18n/t";

export type I18nManager = {
    locale: Locale;
    setLocale: (loc: Locale) => void;
    t: (path: string, opts?: { defaultText?: string }) => string;
    init: () => Promise<void>;
};

export default function useI18nConfig(): I18nManager {
    // Source of truth for current locale lives in both module-level (t.ts) and React state.
    // This hook syncs them.
    const [locale, setLocaleState] = useState<Locale>(getLocale()); // defaults to "en" from t.ts

    const setLocale = useCallback((loc: Locale) => {
        setLocaleState(loc);
        setGlobalLocale(loc);
    }, []);

    const t = useCallback((path: string, opts?: { defaultText?: string }) => {
        // Bind current locale implicitly
        return baseT(path, { locale, defaultText: opts?.defaultText });
    }, [locale]);

    const init = useCallback(async () => {
        // If later you persist the preferred locale in settings, hydrate here.
        // For now, nothing asynchronous is required.
        return Promise.resolve();
    }, []);

    return useMemo(() => ({ locale, setLocale, t, init }), [locale, setLocale, t, init]);
}