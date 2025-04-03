import {useCallback, useState} from "react";
import { invoke } from "@tauri-apps/api/core";
import {JobInsert} from "@/types/JobInsert";
import {JobUpdate} from "@/types/JobUpdate";

interface InsertProps {
    status: boolean;
    message: string;
}

export function useUpsertJob() {
    const [loading, setLoading] = useState(false);

    const upsertJob = useCallback(async (data: JobInsert | JobUpdate): Promise<InsertProps> => {
        const functionToInvoke = "id" in data ? "jobs_update" : "jobs_insert";

        setLoading(true);

        try {
            const message = await invoke<string>(functionToInvoke, { data });
            console.log(message);
            return { status: true, message };
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

            return { status: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return { upsertJob, loading };
}
