import {useEffect, useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEntry} from "@/types/JobEntry";

/*export interface JobsListType {
    columns: Array<{ key: string; label: string | JSX.Element }>;
    rows: Array<JobEntry>;
}*/

export type JobsListRowsType = Array<JobEntry>;

export default function useFetchJobs() {
    const [data, setData] = useState<JobsListRowsType | []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const rows = await invoke<JobsListRowsType>("jobs_get_list");
            setData(rows);
        } catch (err) {
            setError("Failed to fetch jobs");
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchJobs().then(() => {
            console.log("Job list refreshed");
        }).catch(error => {
            console.error("Error refreshing job list:", error);
        });
    }, [fetchJobs]);

    return {data, loading, error, refresh: fetchJobs};
}
