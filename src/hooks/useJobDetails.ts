import {useEffect, useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEntry as JobDetailsType} from "@/types/JobEntry";

export default function useJobDetails({jobId}: { jobId: number }) {
    const [data, setData] = useState<JobDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobDetails = useCallback(async () => {
        if (!jobId) return;

        try {
            setLoading(true);
            setError(null);
            const job_details = await invoke<JobDetailsType>("jobs_get_details", {jobId});
            setData(job_details);
        } catch (err) {
            setError(`Failed to fetch job details #${jobId}`);
            console.error(`Failed to fetch job details #${jobId}:`, err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    // Fetch on mount
    useEffect(() => {
        fetchJobDetails().then(() => {
            console.log("Job details refreshed");
        }).catch(error => {
            console.error("Error refreshing job details:", error);
        });
    }, [fetchJobDetails]);

    return {data, loading, error, refresh: fetchJobDetails};
}
