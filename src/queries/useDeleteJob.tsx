import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";

export default function useDeleteJob() {
    const [state, setState] = useState<{ data: string | null; loading: boolean; error: string | null }>({
        data: null,
        loading: false,
        error: null,
    });

    const deleteJob = async (id: number) => {
        setState({data: null, loading: true, error: null});

        try {
            const message: string = await invoke("delete_job_entry", {id});
            setState({data: message, loading: false, error: null});
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }
            setState({data: null, loading: false, error: errorMessage});
        }
    };

    return {...state, deleteJob};
}
