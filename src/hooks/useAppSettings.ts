import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {debugLog, errorLog} from "@utilities/devLog";
import {AppSettings} from "@/types/AppSettings";

export default function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        debugLog("loadSettings()");

        setLoading(true);
        setError(null);

        try {
            const result = await invoke<AppSettings | null>("load_app_settings");
            setSettings(result);

            debugLog("Settings loaded:", result)
        } catch (err) {
            errorLog("Load settings error:", err);
            setError("Failed to load settings.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }, []);

    const saveSettings = useCallback(async (newSettings: AppSettings) => {
        debugLog("saveSettings(): newSettings passed -> ", newSettings);

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await invoke("save_app_settings", {settings: newSettings});
            setSettings(newSettings);
            setSuccess("Settings saved.");

            debugLog("Settings saved:", newSettings);
        } catch (err) {
            setError("Failed to save settings.");

            errorLog("Save settings error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        settings,
        loadSettings,
        saveSettings,
        loading,
        loaded,
        error,
        success,
    };
}
