import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

export default function useExportData() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const exportJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const now = new Date();
        const formatted = now
            .toISOString()
            .replace(/[-:T]/g, "")
            .split(".")[0];

        const defaultFilename = `jobs_export_${formatted}.json`;

        try {
            const selectedPath = await save({
                filters: [{ name: "JSON", extensions: ["json"] }],
                defaultPath: defaultFilename,
            });

            if (!selectedPath) {
                setLoading(false);
                return;
            }

            await invoke("export_jobs_json", { path: selectedPath });
            setSuccess("Jobs exported successfully.");
        } catch (err) {
            console.error("Export error:", err);
            setError("Failed to export jobs.");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        exportJobs,
        loading,
        error,
        success,
    };
}