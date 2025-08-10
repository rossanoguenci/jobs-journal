import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {debugLog, errorLog} from "@utilities/devLog";

/**
 * Custom React hook for managing application options tied to a specific key.
 *
 * This hook provides an interface for loading and saving option values from a persistent backend
 * while managing their loading, error, and success states for use in your UI. It is designed
 * to simplify reading and updating app-wide settings or user-related data by automatically
 * handling the invocation of backend commands and local state management.
 *
 * @template T - The type of value being managed for the option.
 * @param key - The identifier for the option value you wish to access.
 * @returns An object with:
 *   - value: The current loaded value or null.
 *   - load: Function to asynchronously load the option from the backend.
 *   - save: Function to asynchronously save a value to the backend.
 *   - loading: Boolean indicating if a load or save is in progress.
 *   - loaded: Boolean indicating if the value has ever been successfully loaded.
 *   - error: Error message if the last operation failed, or null otherwise.
 *   - success: Success message from the last successful save, or null otherwise.
 */
export default function useOptions<T = unknown>(key: string) {
    const [value, setValue] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const load = useCallback(async () => {
        debugLog(`load(${key})`);

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await invoke<T>("get_option", {key});
            setValue(result);

            debugLog(`Option loaded (${key}):`, result);
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

            const result = await invoke<T>("get_option", {key});
            setValue(result);

            setSuccess("Option saved & loaded.");
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