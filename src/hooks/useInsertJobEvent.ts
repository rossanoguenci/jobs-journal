import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEvent} from "@/types/JobEvent";


export default function useInsertJobEvent() {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const insertEvent = useCallback(async (data: JobEvent) => {
        const jobId = data.job_id;

        if (!jobId || jobId <= 0) {
            setError(`Ref #job_id invalid "${jobId}"`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await invoke<string>("job_events_insert", {data: data});
            setSuccess(`Event inserted successfully!`);
        } catch (err) {
            setError(`Failed to insert a job events for ${jobId} - ${err}`);
        } finally {
            setLoading(false);
        }

    }, []);

    return {success, loading, error, insertEvent};
}
