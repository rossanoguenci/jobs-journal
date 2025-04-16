import {useCallback, useState} from "react";
import { invoke } from "@tauri-apps/api/core";
import {JobInsert} from "@/types/JobInsert";
import {JobUpdate} from "@/types/JobUpdate";

/*interface InsertProps {
    status: boolean;
    message: string;
}*/

export function useUpsertJob() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const upsertJob = useCallback(async (data: JobInsert | JobUpdate): Promise<void> => {
        const functionToInvoke = "id" in data ? "jobs_update" : "jobs_insert";

        setLoading(true);
        setError(null);  // Clear any previous errors
        setSuccess(null);  // Clear any previous success

        try {
            await invoke<string>(functionToInvoke, { data });
        } catch (error) {
            console.error(`Error invoking Rust function ${functionToInvoke}:`, error);

            let errorMessage = "An error occurred";
            if (typeof error === "string") {
                errorMessage = error;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null && "message" in error) {
                errorMessage = String(error.message);
            }
            setError(errorMessage); // Store error message in state
        } finally {
            setLoading(false);
            setSuccess(functionToInvoke === "jobs_insert" ? "Job entry inserted successfully!" : "Job entry updated successfully!");
        }
    }, []);

    return { upsertJob, loading, error, success };
}
