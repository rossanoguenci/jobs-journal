import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

interface ImportState {
    loading: boolean;
    error: string | null;
    success: string | null;
}

const SUPPORTED_EXTENSIONS = {
    JSON: "json",
    CSV: "csv"
} as const;

const MESSAGES = {
    SUCCESS: "Import completed successfully!",
    ERROR: "Failed to import data.",
    UNSUPPORTED_FILE: "Unsupported file type.",
} as const;

export default function useImportData() {
    const [state, setState] = useState<ImportState>({
        loading: false,
        error: null,
        success: null
    });

    const handleFileImport = async (filePath: string): Promise<void> => {
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        
        switch (fileExtension) {
            case SUPPORTED_EXTENSIONS.JSON:
                await invoke("import_jobs_json", { path: filePath });
                break;
            case SUPPORTED_EXTENSIONS.CSV:
                await invoke("import_jobs_csv", { path: filePath });
                break;
            default:
                throw new Error(MESSAGES.UNSUPPORTED_FILE);
        }
    };

    const updateState = (updates: Partial<ImportState>) => {
        setState(current => ({ ...current, ...updates }));
    };

    const importJobs = useCallback(async () => {
        try {
            updateState({ loading: true, error: null, success: null });

            const selectedPath = await open({
                filters: [{
                    name: "Data files",
                    extensions: Object.values(SUPPORTED_EXTENSIONS)
                }],
                multiple: false,
            });

            if (!selectedPath) return;

            await handleFileImport(selectedPath);
            updateState({ success: MESSAGES.SUCCESS });
        } catch (err) {
            console.error("Import error:", err);
            updateState({ error: MESSAGES.ERROR });
        } finally {
            updateState({ loading: false });
        }
    }, []);

    return {
        importJobs,
        loading: state.loading,
        error: state.error,
        success: state.success
    };
}