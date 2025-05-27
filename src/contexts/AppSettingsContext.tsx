import {
    createContext,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import useAppSettings from "@hooks/useAppSettings";
import {useTheme} from "next-themes";
import {debugLog} from "@utilities/devLog";

const AppSettingsContext = createContext<ReturnType<typeof useAppSettings> | undefined>(undefined);

export function AppSettingsProvider({children}: { children: ReactNode }) {
    const {
        settings,
        loadSettings,
        loaded,
        ...rest
    } = useAppSettings();
    const {setTheme} = useTheme();

    useEffect(() => {
        loadSettings().then();
    }, [loadSettings]);

    useEffect(() => {
        if (loaded && settings?.theme) {
            setTheme(settings.theme);
        }
    }, [loaded, settings?.theme, setTheme]);

    debugLog("AppSettingsContext: ", settings);

    return (
        <AppSettingsContext.Provider value={{settings, loadSettings, loaded, ...rest}}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettingsContext() {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error("useAppSettingsContext must be used inside AppSettingsProvider");
    return ctx;
}
