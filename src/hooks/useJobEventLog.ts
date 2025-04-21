import {useEffect, useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEvent} from "@/types/JobEvent";

export type JobEventsRowsType = Array<JobEvent>;

export default function useJobEventLog({jobId}: { jobId: bigint }) {
    const [data, setData] = useState<JobEventsRowsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobEvents = useCallback(async () => {
        if (!jobId || jobId <= 0) return;

        try {
            setLoading(true);
            setError(null);
            const rows = await invoke<JobEventsRowsType>("job_events_get", {jobId: Number(jobId)});
            setData(rows);
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
