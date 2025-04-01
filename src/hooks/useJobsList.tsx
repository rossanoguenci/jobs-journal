import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {JobEntry} from "../types/JobEntry";

export interface JobsListType {
    columns: Array<{ key: string; label: string }>;
    rows: Array<JobEntry>;
}

export default function useJobsList() {
    const [data, setData] = useState<JobsListType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const rows = await invoke<JobsListType["rows"]>("jobs_get_list");
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
