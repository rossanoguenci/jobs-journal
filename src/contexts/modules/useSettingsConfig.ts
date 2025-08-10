import {useSettingsStore} from "@stores/useSettingsStore";
import useOptions from "@hooks/useOptions";
import {AppSettings} from "@/types/AppSettings";
import {useEffect} from "react";

export function useSettingsConfig() {
    const options = useOptions<AppSettings>("app_settings");

    const appSettings = useSettingsStore((s) => s.appSettings);
    const setAppSettings = useSettingsStore((s) => s.setAppSettings);

    async function init(){
        if(appSettings) return;

        await options.load();
        setAppSettings(options.value);
    }

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
