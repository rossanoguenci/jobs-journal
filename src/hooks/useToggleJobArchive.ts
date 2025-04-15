import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function useToggleJobArchive() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleJobArchive = async ({ id, statusTo }: {
        id: bigint | number,
        statusTo: "archive" | "restore"
    }) => {
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const message: string = await invoke(`jobs_${statusTo}_entry`, { id });
            setSuccess(message);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, success, toggleJobArchive };
}
