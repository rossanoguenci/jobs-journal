import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface JobsListType {
    columns: Array<{ key: string; label: string }>;
    rows: Array<{ id: number; company: string; title: string; application_date: string; status: string }>;
}

export default function useJobsList() {
    const [data, setData] = useState<JobsListType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const rows = await invoke<JobsListType["rows"]>("get_jobs");
            setData({
                columns: [
                    { key: "id", label: "#" },
                    { key: "company", label: "Company" },
                    { key: "title", label: "Title" },
                    { key: "application_date", label: "Date of Application" },
                    { key: "status", label: "Status" },
                    { key: "actions", label: "Actions" },
                ],
                rows,
            });
        } catch (err) {
            setError("Failed to fetch jobs");
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    return { data, loading, error, refresh: fetchJobs };
}
