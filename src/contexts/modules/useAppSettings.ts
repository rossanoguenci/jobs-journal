import {useAppSettingsStore} from "@stores/useAppSettingsStore";
import useOptions from "@hooks/useOptions";
import {AppSettings} from "@/types/AppSettings";
import {useEffect} from "react";

export function useAppSettings() {
    const appSettings = useAppSettingsStore((s) => s.appSettings);
    const setAppSettings = useAppSettingsStore((s) => s.setAppSettings);
    const options = useOptions<AppSettings>("app_settings");

    useEffect(() => {
        if (!appSettings) {
            options.load().then(() => {
                if (!options.error) {
                    setAppSettings(options.value)
                }
            })
        }
    }, [appSettings, options, setAppSettings]);

    return {
        appSettings,
        appSettingsLoading: options.loading,
        appSettingsError: options.error,
        appSettingsSuccess: options.success,
        appSettingsReload: options.load,
        appSettingsReset: () => {
            options.error = null;
            options.success = null;
        },
        hydrateAppSettings: () => {
            if (appSettings === null && options.loaded && options.value) {
                setAppSettings(options.value);
            }
        },
    };
}
