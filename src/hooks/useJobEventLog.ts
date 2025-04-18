import {useEffect, useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEvent as JobEventType} from "@/types/JobEvent";

export interface JobEventsType {
    columns: Array<{ key: string; label: string }>;
    rows: Array<JobEventType>;
}

export default function useJobEventLog({jobId}: { jobId: bigint }) {
    const [data, setData] = useState<JobEventsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobEvents = useCallback(async () => {
        if (!jobId || jobId <= 0) return;

        try {
            setLoading(true);
            setError(null);
            const rows = await invoke<JobEventType[]>("job_events_get", {jobId: Number(jobId)});
            setData({
                columns: [
                    // {key: "id", label: "ID"},
                    // {key: "job_id", label: "Job ID"},
                    {key: "date_of_event", label: "Date of event"},
                    {key: "description", label: "Description"},
                    // {key: "insert_type", label: "Insert Type"},
                    // {key: "insert_date", label: "Insert Date"},
                ],
                rows: rows ?? []
            });
        } catch (err) {
            setError(`Failed to fetch job events #${jobId}`);
            console.error(`Failed to fetch job events #${jobId}:`, err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    // Fetch on mount
    useEffect(() => {
        fetchJobEvents().then(() => {
            console.log("Job events refreshed");
        }).catch(error => {
            console.error("Error refreshing job events:", error);
        });
    }, [fetchJobEvents]);

    return {data, loading, error, refresh: fetchJobEvents};
}
