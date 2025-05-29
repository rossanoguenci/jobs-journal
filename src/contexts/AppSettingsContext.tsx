import {
    createContext,
    useContext,
    useEffect,
    ReactNode,
    useMemo,
} from "react";
import useOptions from "@hooks/useOptions";
import {useTheme} from "next-themes";
import {debugLog} from "@utilities/devLog";
import {AppSettings} from "@/types/AppSettings";

// Stable context type
type AppSettingsContextType = {
    settings: AppSettings | null;
    loadSettings: () => Promise<void>;
    saveSettings: (newValue: AppSettings) => Promise<void>;
    loading: boolean;
    loaded: boolean;
    error: string | null;
    success: string | null;
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({children}: { children: ReactNode }) {
    const {
        value,
        load,
        save,
        loading,
        loaded,
        error,
        success,
    } = useOptions<AppSettings>("app_settings");

    const {setTheme} = useTheme();

    const contextValue = useMemo<AppSettingsContextType>(() => ({
        settings: value,
        loadSettings: load,
        saveSettings: save,
        loading,
        loaded,
        error,
        success,
    }), [value, load, save, loading, loaded, error, success]);

    useEffect(() => {
        load().then();
    }, [load]);

    useEffect(() => {
        if (loaded && value?.theme) {
            setTheme(value.theme);
        }
    }, [loaded, value?.theme, setTheme]);

    debugLog("AppSettingsProvider:", contextValue);

    return (
        <AppSettingsContext.Provider value={contextValue}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettingsContext() {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("useAppSettingsContext must be used inside AppSettingsProvider");
    return ctx;
}
