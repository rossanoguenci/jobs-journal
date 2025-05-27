import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function useClearDatabase() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearDatabase = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await invoke("clear_database");
            setSuccess("Database cleared successfully.");
        } catch (err) {
            console.error("Failed to clear DB:", err);
            setError("Failed to clear database.");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        clearDatabase,
        loading,
        error,
        success,
    };
}
