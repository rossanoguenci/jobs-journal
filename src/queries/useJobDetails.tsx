import {useEffect, useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";

export interface JobDetailsType {
    id: number;
    company: string;
    title: string;
    application_date: string;
    status: string;
    link: string;
}

export default function useJobDetails({jobId}: { jobId: number }) {
    const [data, setData] = useState<JobDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobDetails = useCallback(async () => {
        if (!jobId) return;

        try {
            setLoading(true);
            setError(null);
            const job_details = await invoke<JobDetailsType>("jobs_get_details", { jobId });
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
        fetchJobDetails();
    }, [fetchJobDetails]);

    return {data, loading, error, refresh: fetchJobDetails};
}
