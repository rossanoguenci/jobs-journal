import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {debugLog, errorLog} from "@utilities/devLog";

export default function useOptions<T = unknown>(key: string) {
    const [value, setValue] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const load = useCallback(async () => {
        debugLog(`load(${key})`);
        setLoading(true);
        setError(null);

        try {
            const result = await invoke<T>("get_option", {key});
            setValue(result);
            debugLog("Option loaded:", result);
        } catch (err) {
            errorLog("Load option error:", err);
            setError("Failed to load option.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }, [key]);

    const save = useCallback(async (newValue: T) => {
        debugLog(`save(${key}):`, newValue);
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await invoke("set_option", {key, value: newValue});
            setValue(newValue);
            setSuccess("Option saved.");
            debugLog("Option saved:", newValue);
        } catch (err) {
            errorLog("Save option error:", err);
            setError("Failed to save option.");
        } finally {
            setLoading(false);
        }
    }, [key]);

    return {
        value,
        load,
        save,
        loading,
        loaded,
        error,
        success,
    };
}
