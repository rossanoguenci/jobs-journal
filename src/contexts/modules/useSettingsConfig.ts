import {useSettingsStore} from "@stores/useSettingsStore";
import useOptions from "@hooks/useOptions";
import {AppSettings} from "@/types/AppSettings";
import {useEffect} from "react";

export function useSettingsConfig() {
    const {appSettings, setAppSettings} = useSettingsStore();
    const options = useOptions<AppSettings>("app_settings");

    async function init() {
        if (appSettings) return;

        await options.load();
        setAppSettings(options.value);
    }

    useEffect(() => {
        if (options.loaded && options.value) {
            console.log("useSettingsConfig.useEffect() - loaded", options.value)
            setAppSettings(options.value);
        }
    }, [options.loaded, options.value, setAppSettings]);

    return {
        init,
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
